from pydantic import BaseModel
from typing import List, Dict

class MusicData(BaseModel):
    languages: List[str] = [
        "Hindi", "English", "Punjabi", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam",
        "Spanish", "French", "Korean", "Japanese", "Arabic", "Portuguese", "Russian", "Italian", "German", "Chinese"
    ]

    artists: Dict[str, List[Dict]] = {
        "Hindi": [
            {"name": "Arijit Singh", "photo": "/models/images/ArijitSingh.jpg"},
            {"name": "Shreya Ghoshal", "photo": "/models/images/ShreyaGhoshal.jpg"},
            {"name": "Diljit Dosanjh", "photo": "/models/images/DiljitDosanjh.jpg"},
            {"name": "Badshah", "photo": "/models/images/Badshah.jpg"},
            {"name": "AP Dhillon", "photo": "/models/images/APDhillon.jpg"},
            {"name": "Darshan Raval", "photo": "/models/images/DarshanRaval.jpg"},
            {"name": "Karan Aujla", "photo": "/models/images/KaranAujla.jpg"},
            {"name": "Shubh", "photo": "/models/images/Shubh.jpg"},
            {"name": "Jubin Nautiyal", "photo": "/models/images/JubinNautiyal.jpg"},
            {"name": "Lata Mangeshkar", "photo": "/models/images/LataMangeshkar.jpg"},
            {"name": "Kishore Kumar", "photo": "/models/images/KishoreKumar.jpg"},
            {"name": "Mohammed Rafi", "photo": "/models/images/MohammedRafi.jpg"}
        ],
        "English": [
            {"name": "Taylor Swift", "photo": "/models/images/TaylorSwift.jpg"},
            {"name": "The Weeknd", "photo": "/models/images/TheWeeknd.jpg"},
            {"name": "Billie Eilish", "photo": "/models/images/BillieEilish.jpg"},
            {"name": "Ed Sheeran", "photo": "/models/images/EdSheeran.jpg"},
            {"name": "Drake", "photo": "/models/images/Drake.jpg"},
            {"name": "Ariana Grande", "photo": "/models/images/ArianaGrande.jpg"},
            {"name": "Post Malone", "photo": "/models/images/PostMalone.jpg"},
            {"name": "Harry Styles", "photo": "/models/images/HarryStyles.jpg"},
            {"name": "Olivia Rodrigo", "photo": "/models/images/OliviaRodrigo.jpg"},
            {"name": "Michael Jackson", "photo": "/models/images/MichaelJackson.jpg"},
            {"name": "Elvis Presley", "photo": "/models/images/ElvisPresley.jpg"},
            {"name": "Freddie Mercury", "photo": "/models/images/FreddieMercury.jpg"}
        ],
        "Punjabi": [
            {"name": "Sidhu Moose Wala", "photo": "/models/images/SidhuMooseWala.jpg"},
            {"name": "Diljit Dosanjh", "photo": "/models/images/DiljitDosanjh.jpg"},
            {"name": "AP Dhillon", "photo": "/models/images/APDhillon.jpg"},
            {"name": "Karan Aujla", "photo": "/models/images/KaranAujla.jpg"},
            {"name": "Shubh", "photo": "/models/images/Shubh.jpg"},
            {"name": "Guru Randhawa", "photo": "/models/images/GuruRandhawa.jpg"},
            {"name": "Parmish Verma", "photo": "/models/images/ParmishVerma.jpg"},
            {"name": "Mankirt Aulakh", "photo": "/models/images/MankirtAulakh.jpg"},
            {"name": "Jass Manak", "photo": "/models/images/JassManak.jpg"},
            {"name": "Kuldeep Manak", "photo": "/models/images/KuldeepManak.jpg"},
            {"name": "Gurdas Maan", "photo": "/models/images/GurdasMaan.jpg"},
            {"name": "Amar Singh Chamkila", "photo": "/models/images/AmarSinghChamkila.jpg"}
        ],
        "Tamil": [
            {"name": "Anirudh Ravichander", "photo": "/models/images/AnirudhRavichander.jpg"},
            {"name": "Sid Sriram", "photo": "/models/images/SidSriram.jpg"},
            {"name": "Yuvan Shankar Raja", "photo": "/models/images/YuvanShankarRaja.jpg"},
            {"name": "A. R. Rahman", "photo": "/models/images/AR Rahman.jpg"},
            {"name": "Harris Jayaraj", "photo": "/models/images/HarrisJayaraj.jpg"},
            {"name": "Ilaiyaraaja", "photo": "/models/images/Ilaiyaraaja.jpg"},
            {"name": "Karthik", "photo": "/models/images/Karthik.jpg"},
            {"name": "M. S. Viswanathan", "photo": "/models/images/MSViswanathan.jpg"},
            {"name": "P. Susheela", "photo": "/models/images/PSusheela.jpg"},
            {"name": "S. P. Balasubrahmanyam", "photo": "/models/images/SPBalasubrahmanyam.jpg"}
        ],
        "Telugu": [
            {"name": "DSP", "photo": "/models/images/DSP.jpg"},
            {"name": "Thaman S", "photo": "/models/images/ThamanS.jpg"},
            {"name": "Mickey J Meyer", "photo": "/models/images/MickeyJMeyer.jpg"},
            {"name": "Devi Sri Prasad", "photo": "/models/images/DeviSriPrasad.jpg"},
            {"name": "A. R. Rahman", "photo": "/models/images/AR Rahman.jpg"},
            {"name": "Karthik", "photo": "/models/images/Karthik.jpg"},
            {"name": "Sid Sriram", "photo": "/models/images/SidSriram.jpg"},
            {"name": "Ghantasala", "photo": "/models/images/Ghantasala.jpg"},
            {"name": "S. P. Balasubrahmanyam", "photo": "/models/images/SPBalasubrahmanyam.jpg"},
            {"name": "P. Susheela", "photo": "/models/images/PSusheela.jpg"}
        ],
        "Marathi": [
            {"name": "Ajay-Atul", "photo": "/models/images/AjayAtul.jpg"},
            {"name": "Shreya Ghoshal", "photo": "/models/images/ShreyaGhoshal.jpg"},
            {"name": "Sandeep Khare", "photo": "/models/images/SandeepKhare.jpg"},
            {"name": "Swapnil Bandodkar", "photo": "/models/images/SwapnilBandodkar.jpg"},
            {"name": "Sachin Pilgaonkar", "photo": "/models/images/SachinPilgaonkar.jpg"},
            {"name": "Lata Mangeshkar", "photo": "/models/images/LataMangeshkar.jpg"},
            {"name": "Kishore Kumar", "photo": "/models/images/KishoreKumar.jpg"},
            {"name": "Mukesh", "photo": "/models/images/Mukesh.jpg"},
            {"name": "Sudhir Phadke", "photo": "/models/images/SudhirPhadke.jpg"}
        ],
        "Bengali": [
            {"name": "Arijit Singh", "photo": "/models/images/ArijitSingh.jpg"},
            {"name": "Shreya Ghoshal", "photo": "/models/images/ShreyaGhoshal.jpg"},
            {"name": "Anupam Roy", "photo": "/models/images/AnupamRoy.jpg"},
            {"name": "Rabindranath Tagore", "photo": "/models/images/RabindranathTagore.jpg"},
            {"name": "Kazi Nazrul Islam", "photo": "/models/images/KaziNazrulIslam.jpg"},
            {"name": "Hemanta Mukherjee", "photo": "/models/images/HemantaMukherjee.jpg"},
            {"name": "Manna Dey", "photo": "/models/images/MannaDey.jpg"}
        ],
        "Gujarati": [
            {"name": "Darshan Raval", "photo": "/models/images/DarshanRaval.jpg"},
            {"name": "Jigardan Gadhavi", "photo": "/models/images/JigardanGadhavi.jpg"},
            {"name": "Kinjal Dave", "photo": "/models/images/KinjalDave.jpg"},
            {"name": "Geeta Rabari", "photo": "/models/images/GeetaRabari.jpg"},
            {"name": "Lata Mangeshkar", "photo": "/models/images/LataMangeshkar.jpg"},
            {"name": "Kishore Kumar", "photo": "/models/images/KishoreKumar.jpg"}
        ],
        "Kannada": [
            {"name": "S. P. Balasubrahmanyam", "photo": "/models/images/SPBalasubrahmanyam.jpg"},
            {"name": "Rajesh Krishnan", "photo": "/models/images/RajeshKrishnan.jpg"},
            {"name": "K. S. Chithra", "photo": "/models/images/KSChithra.jpg"},
            {"name": "V. Harikrishna", "photo": "/models/images/VHarikrishna.jpg"},
            {"name": "P. Susheela", "photo": "/models/images/PSusheela.jpg"},
            {"name": "S. Janaki", "photo": "/models/images/SJanaki.jpg"}
        ],
        "Malayalam": [
            {"name": "Shreya Ghoshal", "photo": "/models/images/ShreyaGhoshal.jpg"},
            {"name": "K. J. Yesudas", "photo": "/models/images/KJYesudas.jpg"},
            {"name": "M. G. Sreekumar", "photo": "/models/images/MGSreekumar.jpg"},
            {"name": "K. S. Chithra", "photo": "/models/images/KSChithra.jpg"},
            {"name": "P. Susheela", "photo": "/models/images/PSusheela.jpg"},
            {"name": "S. Janaki", "photo": "/models/images/SJanaki.jpg"}
        ],
        "Spanish": [
            {"name": "Bad Bunny", "photo": "/models/images/BadBunny.jpg"},
            {"name": "Shakira", "photo": "/models/images/Shakira.jpg"},
            {"name": "J Balvin", "photo": "/models/images/JBalvin.jpg"},
            {"name": "Maluma", "photo": "/models/images/Maluma.jpg"},
            {"name": "Rosalía", "photo": "/models/images/Rosalia.jpg"},
            {"name": "Celia Cruz", "photo": "/models/images/CeliaCruz.jpg"}
        ],
        "French": [
            {"name": "Indila", "photo": "/models/images/Indila.jpg"},
            {"name": "Stromae", "photo": "/models/images/Stromae.jpg"},
            {"name": "Zaz", "photo": "/models/images/Zaz.jpg"},
            {"name": "Edith Piaf", "photo": "/models/images/EdithPiaf.jpg"},
            {"name": "Charles Aznavour", "photo": "/models/images/CharlesAznavour.jpg"},
            {"name": "Dalida", "photo": "/models/images/Dalida.jpg"}
        ],
        "Korean": [
            {"name": "BTS", "photo": "/models/images/BTS.jpg"},
            {"name": "BLACKPINK", "photo": "/models/images/BLACKPINK.jpg"},
            {"name": "TWICE", "photo": "/models/images/TWICE.jpg"},
            {"name": "IU", "photo": "/models/images/IU.jpg"},
            {"name": "BoA", "photo": "/models/images/BoA.jpg"},
            {"name": "Rain", "photo": "/models/images/Rain.jpg"}
        ],
        "Japanese": [
            {"name": "YOASOBI", "photo": "/models/images/YOASOBI.jpg"},
            {"name": "Ado", "photo": "/models/images/Ado.jpg"},
            {"name": "LiSA", "photo": "/models/images/LiSA.jpg"},
            {"name": "Utada Hikaru", "photo": "/models/images/UtadaHikaru.jpg"},
            {"name": "Ayumi Hamasaki", "photo": "/models/images/AyumiHamasaki.jpg"},
            {"name": "Namie Amuro", "photo": "/models/images/NamieAmuro.jpg"}
        ],
        "Arabic": [
            {"name": "Mohamed Ramadan", "photo": "/models/images/MohamedRamadan.jpg"},
            {"name": "Amr Diab", "photo": "/models/images/AmrDiab.jpg"},
            {"name": "Nancy Ajram", "photo": "/models/images/NancyAjram.jpg"},
            {"name": "Umm Kulthum", "photo": "/models/images/UmmKulthum.jpg"},
            {"name": "Abdel Halim Hafez", "photo": "/models/images/AbdelHalimHafez.jpg"},
            {"name": "Farid Al-Atrash", "photo": "/models/images/FaridAlAtrash.jpg"}
        ],
        "Portuguese": [
            {"name": "Anitta", "photo": "/models/images/Anitta.jpg"},
            {"name": "Gustavo Lima", "photo": "/models/images/GustavoLima.jpg"},
            {"name": "Marília Mendonça", "photo": "/models/images/MariliaMendonca.jpg"},
            {"name": "Chico Buarque", "photo": "/models/images/ChicoBuarque.jpg"},
            {"name": "Caetano Veloso", "photo": "/models/images/CaetanoVeloso.jpg"},
            {"name": "Elis Regina", "photo": "/models/images/ElisRegina.jpg"}
        ],
        "Russian": [
            {"name": "Zivert", "photo": "/models/images/Zivert.jpg"},
            {"name": "Artik & Asti", "photo": "/models/images/ArtikAndAsti.jpg"},
            {"name": "Miyagi & Andy Panda", "photo": "/models/images/MiyagiAndAndyPanda.jpg"},
            {"name": "Alla Pugacheva", "photo": "/models/images/AllaPugacheva.jpg"},
            {"name": "Valery Leontiev", "photo": "/models/images/ValeryLeontiev.jpg"},
            {"name": "Philip Kirkorov", "photo": "/models/images/PhilipKirkorov.jpg"}
        ],
        "Italian": [
            {"name": "Mahmood", "photo": "/models/images/Mahmood.jpg"},
            {"name": "Marco Mengoni", "photo": "/models/images/MarcoMengoni.jpg"},
            {"name": "Laura Pausini", "photo": "/models/images/LauraPausini.jpg"},
            {"name": "Luciano Pavarotti", "photo": "/models/images/LucianoPavarotti.jpg"},
            {"name": "Andrea Bocelli", "photo": "/models/images/AndreaBocelli.jpg"},
            {"name": "Domenico Modugno", "photo": "/models/images/DomenicoModugno.jpg"}
        ],
        "German": [
            {"name": "Rammstein", "photo": "/models/images/Rammstein.jpg"},
            {"name": "Robin Schulz", "photo": "/models/images/RobinSchulz.jpg"},
            {"name": "Scorpions", "photo": "/models/images/Scorpions.jpg"},
            {"name": "Modern Talking", "photo": "/models/images/ModernTalking.jpg"},
            {"name": "Nena", "photo": "/models/images/Nena.jpg"},
            {"name": "Herbert Grönemeyer", "photo": "/models/images/HerbertGronemeyer.jpg"}
        ],
        "Chinese": [
            {"name": "Jay Chou", "photo": "/models/images/JayChou.jpg"},
            {"name": "JJ Lin", "photo": "/models/images/JJLin.jpg"},
            {"name": "G.E.M.", "photo": "/models/images/GEM.jpg"},
            {"name": "Eason Chan", "photo": "/models/images/EasonChan.jpg"},
            {"name": "Teresa Teng", "photo": "/models/images/TeresaTeng.jpg"},
            {"name": "Leslie Cheung", "photo": "/models/images/LeslieCheung.jpg"}
        ]
    }