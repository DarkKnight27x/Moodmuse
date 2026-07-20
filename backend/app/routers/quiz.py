"""
MoodMuse — quiz recommendation endpoint (v2: preference-vector ranking engine).

=====================================================================
ARCHITECTURE
=====================================================================
This mirrors how a real two-stage recommender is structured, adapted to
what's actually available from the Spotify Web API:

  STAGE 1 — CANDIDATE RETRIEVAL (get a pool of plausible tracks, cheaply)
      Engine A: sp.recommendations() — real audio-feature-targeted results,
                if this app has Extended Quota access.
      Engine B: multi-query smart search — used automatically whenever
                Engine A is unavailable (the common case for apps created
                after Nov 27, 2024, when Spotify locked Recommendations,
                Audio Features, Audio Analysis, and Related Artists behind
                Extended Quota Mode: see
                https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api).
      Both engines can run and their candidates can be merged; either way
      candidates flow into the SAME stage 2 pipeline below, so a favorite
      artist you asked for or a language-purity preference is respected
      no matter which engine sourced the track.

  STAGE 2 — FEATURE ENRICHMENT
      Basic artist/track/album lookups are NOT part of the restricted
      endpoint group, so we can still call sp.artists() to pull each
      candidate's artist genre tags. That gives us a genuine (if coarse)
      content signal — genre-tag overlap with the user's inferred genre
      preferences — as a stand-in for the audio-features we can't fetch.
      Results are cached in-memory since the same artists recur constantly
      across a request's candidate pool.

  STAGE 3 — MULTI-OBJECTIVE RANKING
      Every candidate gets a single composite score blending: relevance
      (genre-tag overlap with the preference vector), popularity, a
      recency/classic alignment term, and language purity — plus an
      additive bonus if the track's artist was one of the user's picks.

  STAGE 4 — DIVERSITY & QUALITY RE-RANKING
      Popularity/obscurity and explicit-content filters are applied with
      cascading relaxation (never return zero tracks just because a niche
      language + strict popularity floor left nothing). A greedy per-artist
      cap keeps the final playlist from being 5 songs by the same act.

The request/response schema is unchanged from the previous version, so the
existing frontend integration keeps working with zero changes.
=====================================================================
"""

from __future__ import annotations

import logging
import random
import time
import os
from collections import OrderedDict, defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

import spotipy
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from spotipy.exceptions import SpotifyException
from spotipy.oauth2 import SpotifyClientCredentials

load_dotenv()

logger = logging.getLogger("moodmuse.quiz")

router = APIRouter()


def _log(event: str, **fields) -> None:
    """Lightweight structured logging without adding a JSON-logging dependency.
    Emits `event=... key=value key2=value2` lines that are still trivially
    greppable/parseable, and easy to swap for real structlog/loguru later."""
    rendered = " ".join(f"{k}={v!r}" for k, v in fields.items())
    logger.info("event=%s %s", event, rendered)


# ============================================================
# Spotify client
# ============================================================
# Credentials MUST come from the environment. Never hardcode them —
# if a client secret has ever been committed or pasted anywhere, rotate it
# immediately in the Spotify Developer Dashboard.

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
    raise RuntimeError(
        "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are not set. "
        "Add them to your .env file — never hardcode credentials in source."
    )

sp = spotipy.Spotify(
    auth_manager=SpotifyClientCredentials(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
    ),
    requests_timeout=8,
    retries=2,
)


# =====================================================================
# ============================ CONFIGURATION =========================
# =====================================================================
# Every quiz-answer -> Spotify-parameter mapping lives in this block, and
# nowhere else. Adding a 16th quiz question is a config-only change: add a
# table entry here, then one or two lines in `build_preference_vector` to
# read it — no ranking/engine code needs to change.

# A conservative, known-good subset of Spotify's former genre-seed list.
# The live `/recommendations/available-genre-seeds` endpoint is part of the
# same restricted group, so we keep a static list rather than depend on it.
KNOWN_GENRE_SEEDS = {
    "pop", "rock", "hip-hop", "r-n-b", "indie", "indie-pop", "electronic",
    "edm", "house", "chill", "ambient", "lo-fi", "study", "sleep",
    "acoustic", "singer-songwriter", "folk", "jazz", "classical",
    "soul", "funk", "dance", "party", "workout", "gym", "romance",
    "sad", "happy", "k-pop", "j-pop", "j-rock", "anime", "latin",
    "reggaeton", "salsa", "punjabi", "desi", "bollywood", "indian",
    "metal", "punk", "alt-rock", "synth-pop", "disco", "groove",
}

# mood ("feeling") -> (valence, energy) baseline. Valence = musical positivity.
MOOD_TO_VALENCE_ENERGY: Dict[str, Tuple[float, float]] = {
    "Energetic & Upbeat": (0.80, 0.80),
    "Calm & Relaxed": (0.55, 0.30),
    "Melancholic / Emotional": (0.20, 0.35),
    "Focused / Deep Work": (0.45, 0.40),
    "Romantic / Dreamy": (0.60, 0.35),
}

# explicit energy-level question refines/overrides the mood's energy baseline
ENERGY_LEVEL_TO_ENERGY: Dict[str, float] = {
    "High energy, danceable": 0.85,
    "Medium energy, groovy": 0.60,
    "Low energy, atmospheric": 0.30,
    "Very chill / lo-fi": 0.20,
}

ENERGY_LEVEL_TO_DANCEABILITY: Dict[str, float] = {
    "High energy, danceable": 0.80,
    "Medium energy, groovy": 0.65,
    "Low energy, atmospheric": 0.35,
    "Very chill / lo-fi": 0.30,
}

# activity -> weighted genre hints. Weight = how central that genre is to
# the activity (used both as Spotify seed_genres and as the target vector
# against which candidate artist genres are scored).
ACTIVITY_TO_GENRES: Dict[str, Dict[str, float]] = {
    "Working / Studying": {"study": 1.0, "lo-fi": 0.9, "ambient": 0.6},
    "Driving / Commuting": {"pop": 0.8, "indie-pop": 0.7, "rock": 0.6},
    "Relaxing at home": {"chill": 1.0, "acoustic": 0.7, "r-n-b": 0.5},
    "Late night vibes": {"r-n-b": 0.8, "ambient": 0.7, "electronic": 0.6},
    "Workout / Gym": {"workout": 1.0, "edm": 0.8, "hip-hop": 0.7},
}

VOCALS_TO_INSTRUMENTALNESS: Dict[str, float] = {
    "Mostly vocals": 0.05,
    "Mix of both": 0.30,
    "Mostly instrumental": 0.75,
}

TEMPO_TO_BPM_RANGE: Dict[str, Tuple[int, int]] = {
    "Slow & Mellow": (60, 95),
    "Medium & Groovy": (95, 120),
    "Fast & Driving": (120, 160),
    "Mixed Tempo": (60, 160),
}

LYRICS_STYLE_TO_INSTRUMENTALNESS_NUDGE: Dict[str, float] = {
    "Lyrics-heavy": -0.15,
    "Atmospheric / instrumental-leaning": 0.25,
    "Mix of both": 0.0,
}

VIBE_TO_GENRES: Dict[str, Dict[str, float]] = {
    "Chill": {"chill": 1.0, "lo-fi": 0.7, "acoustic": 0.5},
    "Intense": {"rock": 0.8, "edm": 0.8, "metal": 0.6},
    "Romantic": {"r-n-b": 0.8, "soul": 0.7, "romance": 1.0},
    "Motivational": {"workout": 0.9, "hip-hop": 0.8, "edm": 0.6},
    "Nostalgic": {"soul": 0.7, "pop": 0.5, "funk": 0.4},
    "Dark & Moody": {"alt-rock": 0.8, "electronic": 0.6, "ambient": 0.5},
}

VOCAL_GENDER_KEYWORD: Dict[str, str] = {
    "Male vocals": "male vocalist",
    "Female vocals": "female vocalist",
    "Mixed / group vocals": "band",
    "No preference": "",
}

DECADE_TO_YEAR_RANGE: Dict[str, str] = {
    "2020s": "2020-2026",
    "2010s": "2010-2019",
    "2000s": "2000-2009",
    "90s": "1990-1999",
    "80s & earlier": "1950-1989",
    "No preference": "1960-2026",
}

# 0.0 = only classics, 1.0 = only brand-new releases. Used as a target the
# ranker computes *distance* against, so "Timeless classics" penalizes
# brand-new tracks just as much as "New releases" penalizes old ones.
ERA_TO_RECENCY_BIAS: Dict[str, float] = {
    "New releases": 0.85,
    "Timeless classics": 0.15,
    "Mix of both": 0.5,
}

# language -> spotify market, genre/keyword hints for search + genre-tag
# matching, and a couple of well-known regional artists used to strengthen
# low-signal regional queries (a plain "punjabi" keyword search returns a
# lot of noise; anchoring one query to a well-known act tightens quality).
LANGUAGE_CONFIG: Dict[str, dict] = {
    "English": {"market": "US", "keywords": ["pop"], "quality_query": "pop hits"},
    "Hindi": {
        "market": "IN", "keywords": ["bollywood", "hindi"],
        "quality_query": "bollywood hits", "anchor_artists": ["Arijit Singh"],
    },
    "Punjabi": {
        "market": "IN", "keywords": ["punjabi"],
        "quality_query": "punjabi hits", "anchor_artists": ["Diljit Dosanjh"],
    },
    "Tamil": {
        "market": "IN", "keywords": ["kollywood", "tamil"],
        "quality_query": "tamil hit songs", "anchor_artists": ["Anirudh Ravichander"],
    },
    "Telugu": {
        "market": "IN", "keywords": ["tollywood", "telugu"],
        "quality_query": "telugu hit songs", "anchor_artists": ["Devi Sri Prasad"],
    },
    "Korean": {"market": "KR", "keywords": ["k-pop"], "quality_query": "k-pop hits"},
    "Japanese": {"market": "JP", "keywords": ["j-pop"], "quality_query": "j-pop hits"},
    "Spanish": {"market": "ES", "keywords": ["latin", "reggaeton"], "quality_query": "latin hits"},
    "No Preference": {"market": "US", "keywords": [], "quality_query": ""},
}

DURATION_TO_TRACK_COUNT: Dict[str, int] = {
    "30–45 mins": 11,
    "1 hour": 16,
    "1.5+ hours": 24,
}
DEFAULT_TRACK_COUNT = 15

EXPLICIT_ALLOWED: Dict[str, Optional[bool]] = {
    "Yes, that's fine": True,
    "Keep it clean": False,
    "Doesn't matter": None,  # no filtering
}

# era -> (strict popularity floor, relaxed "deep cut" floor). "Timeless
# classics" gets a much lower floor on both counts, since legitimately
# great older tracks often carry a lower Spotify popularity score than
# current hits simply due to stream-count recency bias in that metric.
ERA_TO_POPULARITY_FLOORS: Dict[str, Tuple[int, int]] = {
    "New releases": (35, 20),
    "Timeless classics": (15, 5),
    "Mix of both": (22, 10),
}
DEFAULT_POPULARITY_FLOORS: Tuple[int, int] = (22, 10)

# multi-objective ranking weights — tune here, not inside the ranking code.
RANKING_WEIGHTS = {
    "relevance": 0.30,
    "popularity": 0.15,
    "recency": 0.08,
    "language_purity": 0.30,
    "jitter": 0.02,
    "artist_affinity_bonus": 0.45,   # very strong preference for Arijit etc.
}

DIVERSITY_MAX_PER_ARTIST_DEFAULT = 2
ARTIST_GENRE_BATCH_SIZE = 50  # Spotify's max ids per `sp.artists()` call


# =====================================================================
# ============================== MODELS ===============================
# =====================================================================


class QuizAnswers(BaseModel):
    """Unchanged from the previous version — full backward compatibility
    with the existing frontend request shape."""
    languages: List[str] = Field(default_factory=list)
    artists: List[str] = Field(default_factory=list)
    answers: Dict[str, str] = Field(default_factory=dict)
    notes: str = ""


class TrackOut(BaseModel):
    id: Optional[str] = None
    name: str
    artist: str
    album: str
    image: Optional[str] = None
    preview_url: Optional[str] = None
    spotify_url: Optional[str] = None
    popularity: int = 0


class QuizResponse(BaseModel):
    playlist_name: str
    description: str
    tracks: List[TrackOut]
    source: str  # "recommendations" | "search_fallback" | "recommendations+search"
    used_fallback: bool


@dataclass
class PreferenceVector:
    """The entire quiz, collapsed into a single scoring target. Every field
    here is either a direct Spotify recommendation parameter or a weight
    used later by the ranker — nothing here is presentation logic."""

    # audio-character targets (Spotify's own 0.0-1.0 scale, used verbatim
    # when the real Recommendations engine is available)
    energy: float = 0.5
    valence: float = 0.5
    danceability: float = 0.5
    acousticness: float = 0.3
    instrumentalness: float = 0.2
    tempo_range: Tuple[int, int] = (60, 160)

    # weighted genre targets — higher weight = more central to the request.
    # Used both to pick seed_genres and to score candidate artist genres.
    target_genres: Dict[str, float] = field(default_factory=dict)
    seed_genres: List[str] = field(default_factory=list)

    # temporal target: 0.0 = only classics, 1.0 = only brand-new
    recency_bias: float = 0.5
    year_range: str = "1960-2026"

    # weighted language preference (sums to ~1.0 across selected languages;
    # empty dict = no language signal, treated as neutral everywhere)
    language_weights: Dict[str, float] = field(default_factory=dict)
    market: str = "US"

    # favorite-artist affinity: name.lower() -> weight (1.0 = explicit pick)
    artist_affinity: Dict[str, float] = field(default_factory=dict)
    seed_artist_ids: List[str] = field(default_factory=list)

    # quality / business controls
    popularity_floor: int = 22
    obscure_popularity_floor: int = 10
    allow_explicit: Optional[bool] = None
    diversity_max_per_artist: int = DIVERSITY_MAX_PER_ARTIST_DEFAULT
    track_count_target: int = DEFAULT_TRACK_COUNT


@dataclass
class CandidateTrack:
    """A raw Spotify track dict plus everything the ranking stage needs
    that isn't on the dict itself."""
    raw: dict
    origin_languages: Set[str] = field(default_factory=set)
    retrieval_sources: Set[str] = field(default_factory=set)  # "recommendations" | "search:<query-type>"
    query_hits: int = 0  # how many distinct fallback queries surfaced this track

    @property
    def id(self) -> Optional[str]:
        return self.raw.get("id")

    @property
    def primary_artist(self) -> Tuple[Optional[str], Optional[str]]:
        artists = self.raw.get("artists", [])
        if not artists:
            return None, None
        return artists[0].get("id"), artists[0].get("name")

    @property
    def popularity(self) -> int:
        return self.raw.get("popularity", 0)

    @property
    def explicit(self) -> bool:
        return bool(self.raw.get("explicit"))

    @property
    def release_year(self) -> Optional[int]:
        date = self.raw.get("album", {}).get("release_date", "")
        return int(date[:4]) if date[:4].isdigit() else None


# =====================================================================
# ============================== CACHES ================================
# =====================================================================
# Simple in-memory, size-capped caches. They live for the lifetime of the
# process — fine for a single-instance deployment; swap for Redis if you
# scale to multiple workers and want cache sharing across them.


class _BoundedCache:
    def __init__(self, max_size: int = 2000):
        self._store: "OrderedDict[str, object]" = OrderedDict()
        self._max_size = max_size

    def get(self, key: str):
        if key not in self._store:
            return None
        self._store.move_to_end(key)
        return self._store[key]

    def set(self, key: str, value) -> None:
        self._store[key] = value
        self._store.move_to_end(key)
        if len(self._store) > self._max_size:
            self._store.popitem(last=False)

    def __len__(self) -> int:
        return len(self._store)


_artist_id_cache = _BoundedCache()      # artist name (lower) -> Optional[artist_id]
_artist_genre_cache = _BoundedCache()   # artist_id -> List[str] genres


# =====================================================================
# ======================= PREFERENCE VECTOR BUILD ======================
# =====================================================================


def _merge_genre_weights(target: Dict[str, float], addition: Dict[str, float]) -> None:
    for genre, weight in addition.items():
        target[genre] = target.get(genre, 0.0) + weight


def _primary_market(quiz: QuizAnswers) -> str:
    for lang in quiz.languages:
        if lang != "No Preference" and lang in LANGUAGE_CONFIG:
            return LANGUAGE_CONFIG[lang]["market"]
    return "US"


def _build_language_weights(quiz: QuizAnswers) -> Dict[str, float]:
    real_langs = [l for l in quiz.languages if l != "No Preference" and l in LANGUAGE_CONFIG]
    if not real_langs:
        return {}

    language_mix_answer = quiz.answers.get("languageMix", "")
    if language_mix_answer == "One language only" and len(real_langs) > 1:
        # user marked several as acceptable in the quick stage-1 picker, but
        # the mood question says they actually want one dominant language —
        # concentrate most of the weight on their first pick.
        primary, rest = real_langs[0], real_langs[1:]
        weights = {primary: 0.75}
        if rest:
            share = 0.25 / len(rest)
            for l in rest:
                weights[l] = share
        return weights

    # equal split across all selected languages
    share = 1.0 / len(real_langs)
    return {l: share for l in real_langs}


def build_preference_vector(quiz: QuizAnswers) -> PreferenceVector:
    a = quiz.answers
    v = PreferenceVector()

    v.market = _primary_market(quiz)
    v.language_weights = _build_language_weights(quiz)

    # --- valence / energy baseline from mood, refined by explicit energy level
    feeling = a.get("feeling", "")
    base_valence, base_energy = MOOD_TO_VALENCE_ENERGY.get(feeling, (0.5, 0.5))
    v.valence = base_valence

    energy_answer = a.get("energy", "")
    v.energy = ENERGY_LEVEL_TO_ENERGY.get(energy_answer, base_energy)
    v.danceability = ENERGY_LEVEL_TO_DANCEABILITY.get(energy_answer, 0.5)

    # --- vocals / instrumentalness, nudged by the lyrics-density question
    vocals_answer = a.get("vocals", "")
    instrumentalness = VOCALS_TO_INSTRUMENTALNESS.get(vocals_answer, 0.3)
    nudge = LYRICS_STYLE_TO_INSTRUMENTALNESS_NUDGE.get(a.get("lyricsStyle", ""), 0.0)
    v.instrumentalness = min(1.0, max(0.0, instrumentalness + nudge))

    # --- acousticness leans on the "production quality" question
    production = a.get("production", "")
    if production == "Doesn't matter, raw is fine":
        v.acousticness = 0.6
    elif production == "Very important — polished & hi-fi":
        v.acousticness = 0.15
    else:
        v.acousticness = 0.3

    # --- tempo range
    v.tempo_range = TEMPO_TO_BPM_RANGE.get(a.get("tempo", ""), (60, 160))

    # --- weighted genre target: activity + vibe + language keywords
    genre_weights: Dict[str, float] = {}
    _merge_genre_weights(genre_weights, ACTIVITY_TO_GENRES.get(a.get("activity", ""), {}))
    _merge_genre_weights(genre_weights, VIBE_TO_GENRES.get(a.get("vibe", ""), {}))
    for lang, lang_weight in v.language_weights.items():
        lang_genres = {kw: 0.6 * lang_weight for kw in LANGUAGE_CONFIG.get(lang, {}).get("keywords", [])}
        _merge_genre_weights(genre_weights, lang_genres)

    v.target_genres = genre_weights
    # seed_genres for the real Recommendations call: top 3 by weight, must
    # be from Spotify's known seed list (Spotify rejects unknown genre ids)
    ranked_genres = sorted(genre_weights.items(), key=lambda kv: kv[1], reverse=True)
    v.seed_genres = [g for g, _ in ranked_genres if g in KNOWN_GENRE_SEEDS][:3]

    # --- favorite artists -> affinity weights + resolved seed artist ids
    generic_choices = {"surprise me", "no strong preference"}
    v.artist_affinity = {
        name.strip().lower(): 1.0
        for name in quiz.artists
        if name.strip().lower() not in generic_choices
    }
    remaining_seed_slots = max(0, 5 - len(v.seed_genres))
    v.seed_artist_ids = _resolve_seed_artists(list(v.artist_affinity.keys()), v.market, limit=remaining_seed_slots)

    # --- recency target + year window from decade/era
    era = a.get("era", "")
    v.recency_bias = ERA_TO_RECENCY_BIAS.get(era, 0.5)
    v.year_range = DECADE_TO_YEAR_RANGE.get(a.get("decade", ""), "1960-2026")

    # --- popularity floors (context-aware: classics get a lower bar)
    v.popularity_floor, v.obscure_popularity_floor = ERA_TO_POPULARITY_FLOORS.get(
        era, DEFAULT_POPULARITY_FLOORS
    )

    # --- explicit content preference
    v.allow_explicit = EXPLICIT_ALLOWED.get(a.get("explicit", ""), None)

    # --- desired playlist length -> approximate track count (~3.5 min/track)   
    v.track_count_target = 15
    return v


# =====================================================================
# ===================== ARTIST RESOLUTION (cached) =====================
# =====================================================================


def _resolve_artist_id(name: str, market: str) -> Optional[str]:
    cache_key = f"{name.strip().lower()}::{market}"
    cached = _artist_id_cache.get(cache_key)
    if cached is not None:
        return cached or None  # cache stores "" for "looked up, not found"

    try:
        res = sp.search(q=f'artist:"{name}"', type="artist", limit=1, market=market)
        items = res.get("artists", {}).get("items", [])
        artist_id = items[0]["id"] if items else ""
    except SpotifyException as e:
        logger.warning("Artist lookup failed for %r: %s", name, e)
        artist_id = ""
    except Exception as e:
        logger.warning("Unexpected error resolving artist %r: %s", name, e)
        artist_id = ""

    _artist_id_cache.set(cache_key, artist_id)
    return artist_id or None


def _resolve_seed_artists(artist_names: List[str], market: str, limit: int) -> List[str]:
    ids: List[str] = []
    for name in artist_names:
        if len(ids) >= limit:
            break
        artist_id = _resolve_artist_id(name, market)
        if artist_id:
            ids.append(artist_id)
    return ids


def _fetch_artist_genres_bulk(artist_ids: List[str]) -> Dict[str, List[str]]:
    """Batched, cached artist genre lookup. `artists`/`artist` are plain
    catalog endpoints (not part of the Nov-2024 restricted group), so this
    works on every app tier — it's our main content-based relevance signal
    given that audio-features itself is unavailable."""
    result: Dict[str, List[str]] = {}
    to_fetch: List[str] = []

    for aid in set(artist_ids):
        if not aid:
            continue
        cached = _artist_genre_cache.get(aid)
        if cached is not None:
            result[aid] = cached
        else:
            to_fetch.append(aid)

    for i in range(0, len(to_fetch), ARTIST_GENRE_BATCH_SIZE):
        chunk = to_fetch[i : i + ARTIST_GENRE_BATCH_SIZE]
        try:
            res = sp.artists(chunk)
            for artist in res.get("artists", []):
                if not artist:
                    continue
                genres = [g.lower() for g in artist.get("genres", [])]
                result[artist["id"]] = genres
                _artist_genre_cache.set(artist["id"], genres)
        except SpotifyException as e:
            logger.warning("Bulk artist genre fetch failed for chunk of %d: %s", len(chunk), e)
        except Exception as e:
            logger.warning("Unexpected error in bulk artist genre fetch: %s", e)

    return result


# =====================================================================
# ================== ENGINE A — real Spotify Recommendations ===========
# =====================================================================


def _try_recommendations_engine(vector: PreferenceVector) -> List[CandidateTrack]:
    """Attempt the real `/recommendations` endpoint. Returns [] (never
    raises) if the endpoint is unavailable for this app tier, or on any API
    failure — callers should treat an empty list as "engine unavailable"."""
    seed_genres = vector.seed_genres[:5] or (["pop"] if not vector.seed_artist_ids else [])
    seed_artists = vector.seed_artist_ids[: max(0, 5 - len(seed_genres))]

    if not seed_genres and not seed_artists:
        seed_genres = ["pop"]

    try:
        result = sp.recommendations(
            seed_genres=seed_genres,
            seed_artists=seed_artists,
            limit=min(max(vector.track_count_target * 2, 20), 100),
            market=vector.market,
            target_energy=vector.energy,
            target_valence=vector.valence,
            target_danceability=vector.danceability,
            target_acousticness=vector.acousticness,
            target_instrumentalness=vector.instrumentalness,
            min_popularity=vector.obscure_popularity_floor,
        )
        tracks = result.get("tracks", [])
        _log("recommendations_engine_ok", count=len(tracks))
        return [CandidateTrack(raw=t, retrieval_sources={"recommendations"}) for t in tracks if t]
    except SpotifyException as e:
        # 403/404 here almost always means this app doesn't have Extended
        # Quota access to the Recommendations endpoint (post Nov-2024 apps).
        _log("recommendations_engine_unavailable", reason=str(e))
        return []
    except Exception as e:
        logger.warning("Recommendations engine failed unexpectedly: %s", e)
        return []


# =====================================================================
# ================ ENGINE B — smart multi-query search fallback ========
# =====================================================================

_MOOD_KEYWORDS: Dict[str, str] = {
    "Energetic & Upbeat": "energetic upbeat",
    "Calm & Relaxed": "chill relaxed",
    "Melancholic / Emotional": "sad emotional",
    "Focused / Deep Work": "focus instrumental",
    "Romantic / Dreamy": "romantic dreamy",
}

_VIBE_KEYWORDS: Dict[str, str] = {
    "Chill": "chill",
    "Intense": "intense",
    "Romantic": "romantic",
    "Motivational": "motivational hype",
    "Nostalgic": "throwback classic",
    "Dark & Moody": "dark moody",
}


@dataclass
class _SearchQuery:
    query: str
    origin_language: Optional[str] = None
    query_type: str = "general"  # general | language | activity | vibe | artist | regional_quality


def _build_search_queries(quiz: QuizAnswers, vector: PreferenceVector) -> List[_SearchQuery]:
    """More focused search queries for higher quality."""
    a = quiz.answers
    year_filter = f"year:{vector.year_range}"
    queries: List[_SearchQuery] = []

    selected_languages = [l for l in quiz.languages if l != "No Preference" and l in LANGUAGE_CONFIG]

    # Strong language-focused queries
    for lang in selected_languages:
        cfg = LANGUAGE_CONFIG.get(lang, {})
        
        # High quality regional query
        quality_q = cfg.get("quality_query", "")
        if quality_q:
            queries.append(_SearchQuery(
                f"{quality_q} {year_filter}".strip(),
                origin_language=lang,
                query_type="regional_quality"
            ))

        # Anchor artists (very important for Hindi)
        for anchor in cfg.get("anchor_artists", []):
            queries.append(_SearchQuery(
                f'artist:"{anchor}" {year_filter}',
                origin_language=lang,
                query_type="regional_quality"
            ))

        # Mood + language
        mood_kw = _MOOD_KEYWORDS.get(a.get("feeling", ""), "")
        if mood_kw:
            lang_kw = " ".join(cfg.get("keywords", []))
            queries.append(_SearchQuery(
                f"{mood_kw} {lang_kw} {year_filter}".strip(),
                origin_language=lang,
                query_type="language"
            ))

    # User favorite artists (highest priority)
    for artist in quiz.artists:
        if artist.strip().lower() not in {"surprise me", "no strong preference"}:
            queries.append(_SearchQuery(
                f'artist:"{artist}" {year_filter}',
                query_type="artist"
            ))

    # Remove duplicates
    seen = set()
    unique = []
    for sq in queries:
        if sq.query and sq.query not in seen:
            seen.add(sq.query)
            unique.append(sq)

    return unique[:8]

def _search_fallback_engine(quiz: QuizAnswers, vector: PreferenceVector) -> List[CandidateTrack]:
    """Simplified and more reliable search fallback."""
    queries = _build_search_queries(quiz, vector)
    collected: Dict[str, CandidateTrack] = {}

    for sq in queries:
        if not sq.query or len(sq.query.strip()) < 5:
            continue  # skip very weak queries

        try:
            res = sp.search(
                q=sq.query,
                type="track",
                limit=10,          # reduced for stability
                market=vector.market or "IN"
            )
            for track in res.get("tracks", {}).get("items", []):
                tid = track.get("id") if track else None
                if not tid:
                    continue
                if tid not in collected:
                    collected[tid] = CandidateTrack(
                        raw=track,
                        origin_languages={sq.origin_language} if sq.origin_language else set(),
                        retrieval_sources={f"search:{sq.query_type}"},
                        query_hits=1,
                    )
        except Exception as e:
            logger.warning("Search query failed (%r): %s", sq.query, e)
            continue

    _log("search_fallback_engine_ok", queries=len(queries), candidates=len(collected))
    return list(collected.values())

# =====================================================================
# ======================= STAGE 3 — RANKING =============================
# =====================================================================


def _genre_relevance(candidate: CandidateTrack, vector: PreferenceVector, artist_genres: Dict[str, List[str]]) -> float:
    if not vector.target_genres:
        return 0.5  # neutral — nothing to compare against
    artist_id, _ = candidate.primary_artist
    genres = artist_genres.get(artist_id, []) if artist_id else []
    if not genres:
        return 0.5  # unknown artist genres — don't punish, stay neutral

    total_weight = sum(vector.target_genres.values()) or 1.0
    matched_weight = 0.0
    for genre in genres:
        for target_genre, weight in vector.target_genres.items():
            # substring match handles cases like "modern bollywood" matching
            # target genre "bollywood"
            if target_genre in genre or genre in target_genre:
                matched_weight += weight
                break
    return min(1.0, matched_weight / total_weight)


def _recency_alignment(candidate: CandidateTrack, vector: PreferenceVector) -> float:
    year = candidate.release_year
    if year is None:
        return 0.5
    age = max(0, 2026 - year)
    newness = max(0.0, 1.0 - age / 40.0)  # 1.0 = brand new, decays over ~40yrs
    # distance-based alignment: how close is this track's newness to what
    # the user asked for (recency_bias)? Works symmetrically for classics.
    return 1.0 - abs(vector.recency_bias - newness)


def _language_purity(candidate: CandidateTrack, vector: PreferenceVector, artist_genres: Dict[str, List[str]]) -> float:
    if not vector.language_weights:
        return 0.5  # no language signal requested

    if candidate.origin_languages:
        matched = sum(vector.language_weights.get(l, 0.0) for l in candidate.origin_languages)
        total = sum(vector.language_weights.values()) or 1.0
        return min(1.0, matched / total)

    # engine-A tracks (or untagged) have no origin_language — fall back to
    # a soft genre-tag heuristic
    artist_id, _ = candidate.primary_artist
    genres = artist_genres.get(artist_id, []) if artist_id else []
    if not genres:
        return 0.5
    for lang, weight in vector.language_weights.items():
        keywords = LANGUAGE_CONFIG.get(lang, {}).get("keywords", [])
        if any(kw in g for g in genres for kw in keywords):
            return min(1.0, weight / (sum(vector.language_weights.values()) or 1.0) + 0.4)
    return 0.3  # selected languages but no matching signal at all


def _artist_affinity_bonus(candidate: CandidateTrack, vector: PreferenceVector) -> float:
    _, name = candidate.primary_artist
    if not name:
        return 0.0
    return vector.artist_affinity.get(name.strip().lower(), 0.0)


def _composite_score(candidate: CandidateTrack, vector: PreferenceVector, artist_genres: Dict[str, List[str]]) -> float:
    w = RANKING_WEIGHTS
    relevance = _genre_relevance(candidate, vector, artist_genres)
    popularity = candidate.popularity / 100.0
    recency = _recency_alignment(candidate, vector)
    language_purity = _language_purity(candidate, vector, artist_genres)
    # small boost for tracks multiple fallback queries agreed on
    consensus_bonus = min(0.06, 0.02 * (candidate.query_hits - 1)) if candidate.query_hits > 1 else 0.0

    blended = (
        w["relevance"] * relevance
        + w["popularity"] * popularity
        + w["recency"] * recency
        + w["language_purity"] * language_purity
        + w["jitter"] * random.uniform(0, 1)
    )
    affinity_bonus = w["artist_affinity_bonus"] * _artist_affinity_bonus(candidate, vector)

    return blended + affinity_bonus + consensus_bonus


# =====================================================================
# =================== STAGE 4 — FILTER, RANK, DIVERSIFY =================
# =====================================================================
def _is_junk_track(candidate: CandidateTrack) -> bool:
    """Hard filter for low-quality / irrelevant tracks."""
    name = (candidate.raw.get("name") or "").lower()
    album = (candidate.raw.get("album", {}).get("name") or "").lower()
    artist = ""
    artists = candidate.raw.get("artists", [])
    if artists:
        artist = (artists[0].get("name") or "").lower()

    junk_keywords = [
        "white noise", "brown noise", "pink noise", "sleep", "rain sounds",
        "fan noise", "noise machine", "loopable", "baby sleep", "deep sleep",
        "relaxing sounds", "nature sounds", "thunderstorm", "ocean waves",
        "meditation music", "binaural", "8d audio", "slowed + reverb",
        "nightcore", "instrumental only", "karaoke", "for dogs", "dog",
        "cat", "pets", "woof", "relaxing music for", "study music",
        "lofi hip hop radio", "jazz instrumental", "saxophone", "coffeehouse"
    ]

    text = f"{name} {album} {artist}"
    return any(k in text for k in junk_keywords)
def _passes_explicit(candidate: CandidateTrack, allow_explicit: Optional[bool]) -> bool:
    return allow_explicit is None or candidate.explicit == allow_explicit

def _filter_with_relaxation(candidates: List[CandidateTrack], vector: PreferenceVector) -> Tuple[List[CandidateTrack], bool]:
    """Higher quality filtering with cascading relaxation."""
    target = 12   # aim for ~12 strong tracks

    # First remove obvious junk
    candidates = [c for c in candidates if not _is_junk_track(c)]

    def _pop_ok(c: CandidateTrack, floor: int) -> bool:
        return c.popularity >= floor

    # Stage A: Good popularity + explicit preference
    stage_a = [
        c for c in candidates
        if _pop_ok(c, max(vector.popularity_floor, 15)) and _passes_explicit(c, vector.allow_explicit)
    ]
    if len(stage_a) >= target:
        return stage_a, False

    # Stage B: Slightly lower popularity floor
    stage_b = [
        c for c in candidates
        if _pop_ok(c, max(vector.obscure_popularity_floor, 8)) and _passes_explicit(c, vector.allow_explicit)
    ]
    if len(stage_b) >= target:
        return stage_b, True

    # Stage C: Keep explicit filter but drop popularity requirement
    stage_c = [c for c in candidates if _passes_explicit(c, vector.allow_explicit)]
    if len(stage_c) >= 8:
        return stage_c, True

    # Stage D: Last resort
    return candidates, True

def _diverse_top_k(ranked: List[CandidateTrack], vector: PreferenceVector) -> List[CandidateTrack]:
    """Greedy per-artist cap with cascading relaxation: if the strict cap
    leaves us short of the target count (e.g. a very homogeneous candidate
    pool), raise the cap by one and do another pass rather than under-fill
    the playlist."""
    target = vector.track_count_target
    cap = max(1, vector.diversity_max_per_artist)

    def _select(cap_value: int) -> List[CandidateTrack]:
        counts: Dict[str, int] = defaultdict(int)
        selected: List[CandidateTrack] = []
        for c in ranked:
            _, artist_name = c.primary_artist
            key = (artist_name or c.id or "").lower()
            if counts[key] >= cap_value:
                continue
            counts[key] += 1
            selected.append(c)
            if len(selected) >= target:
                break
        return selected

    result = _select(cap)
    while len(result) < min(target, len(ranked)) and cap < len(ranked):
        cap += 1
        result = _select(cap)
    return result


def rank_and_select(candidates: List[CandidateTrack], vector: PreferenceVector) -> Tuple[List[CandidateTrack], bool]:
    """Unified stage-2/3/4 pipeline shared by both retrieval engines."""
    if not candidates:
        return [], False

    artist_ids = [c.primary_artist[0] for c in candidates if c.primary_artist[0]]
    artist_genres = _fetch_artist_genres_bulk(artist_ids)

    filtered, used_relaxed_filters = _filter_with_relaxation(candidates, vector)

    scored = sorted(
        filtered,
        key=lambda c: _composite_score(c, vector, artist_genres),
        reverse=True,
    )

    final = _diverse_top_k(scored, vector)
    _log(
        "rank_and_select_done",
        candidates_in=len(candidates),
        after_filter=len(filtered),
        final=len(final),
        used_relaxed_filters=used_relaxed_filters,
    )
    return final, used_relaxed_filters


# =====================================================================
# ===================== FORMATTING / PLAYLIST NAMING =====================
# =====================================================================

_NAME_BY_FEELING: Dict[str, str] = {
    "Energetic & Upbeat": "Voltage Bloom",
    "Calm & Relaxed": "Soft Static",
    "Melancholic / Emotional": "Blue Hour Echoes",
    "Focused / Deep Work": "Signal Lock",
    "Romantic / Dreamy": "Velvet Frequency",
}


def _generate_playlist_name(quiz: QuizAnswers) -> str:
    feeling = quiz.answers.get("feeling", "")
    base = _NAME_BY_FEELING.get(feeling, "Custom Frequency")
    activity = quiz.answers.get("activity", "")
    return f"{base} · {activity}" if activity else base


def _generate_description(quiz: QuizAnswers, vector: PreferenceVector, used_relaxed_filters: bool) -> str:
    a = quiz.answers
    lang_names = [l for l in quiz.languages if l != "No Preference"]
    lang_part = f" in {', '.join(lang_names)}" if lang_names else ""
    energy_part = a.get("energy", "a balanced mix").lower()
    activity_part = a.get("activity", "right now").lower()
    vibe_part = a.get("vibe", "")
    vibe_suffix = f" with a {vibe_part.lower()} edge" if vibe_part else ""
    deep_cut_note = " Includes a few lesser-known picks to keep it interesting." if used_relaxed_filters else ""
    return (
        f"A {energy_part}{lang_part}, tuned for {activity_part}{vibe_suffix}. "
        f"~{vector.track_count_target} tracks.{deep_cut_note}"
    )


def _format_tracks(candidates: List[CandidateTrack]) -> List[TrackOut]:
    out = []
    for c in candidates:
        t = c.raw
        images = t.get("album", {}).get("images", [])
        artists = t.get("artists", [])
        out.append(
            TrackOut(
                id=t.get("id"),
                name=t.get("name", "Unknown Track"),
                artist=artists[0]["name"] if artists else "Unknown Artist",
                album=t.get("album", {}).get("name", ""),
                image=images[0]["url"] if images else None,
                preview_url=t.get("preview_url"),
                spotify_url=t.get("external_urls", {}).get("spotify"),
                popularity=t.get("popularity", 0),
            )
        )
    return out


# =====================================================================
# ================================ ENDPOINT ==============================
# =====================================================================


@router.post("/recommend", response_model=QuizResponse)
async def get_quiz_recommendations(quiz: QuizAnswers) -> QuizResponse:
    try:
        vector = build_preference_vector(quiz)
    except Exception as e:
        logger.exception("Failed to build preference vector")
        raise HTTPException(status_code=400, detail="Could not process quiz answers") from e

    sources_used: List[str] = []

    candidates = _try_recommendations_engine(vector)
    if candidates:
        sources_used.append("recommendations")

    # Always top up with the search engine if the primary engine came back
    # thin — a richer candidate pool only helps the ranking/diversity stage,
    # and the search engine is what supplies language-purity tagging.
    if len(candidates) < vector.track_count_target * 2:
        try:
            search_candidates = _search_fallback_engine(quiz, vector)
        except Exception as e:
            logger.exception("Search fallback engine failed")
            search_candidates = []
            if not candidates:
                raise HTTPException(
                    status_code=502, detail="Spotify search failed for this quiz"
                ) from e
        if search_candidates:
            sources_used.append("search_fallback")
            existing_ids = {c.id for c in candidates}
            candidates.extend(c for c in search_candidates if c.id not in existing_ids)

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail="No matching tracks found — try loosening your quiz answers.",
        )

    final_candidates, used_relaxed_filters = rank_and_select(candidates, vector)
    tracks_out = _format_tracks(final_candidates)

    source_label = "+".join(sources_used) if sources_used else "search_fallback"

    return QuizResponse(
        playlist_name=_generate_playlist_name(quiz),
        description=_generate_description(quiz, vector, used_relaxed_filters),
        tracks=tracks_out,
        source=source_label,
        used_fallback="recommendations" not in sources_used,
    )