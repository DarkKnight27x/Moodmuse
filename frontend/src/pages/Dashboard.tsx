import { Play, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';

const playlists = [
  { title: "Midnight Pulse", artist: "Nova Wave", image: "https://picsum.photos/id/1015/300/300", mood: "Electric" },
  { title: "Echoes of You", artist: "Luna Ray", image: "https://picsum.photos/id/102/300/300", mood: "Dreamy" },
  { title: "Hyperdrive", artist: "Pulse Theory", image: "https://picsum.photos/id/106/300/300", mood: "Energetic" },
  { title: "Soft Gravity", artist: "Aurora Sky", image: "https://picsum.photos/id/133/300/300", mood: "Calm" },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Good evening, Alex</h1>
          <p className="text-xl text-gray-400 mt-2">What are we listening to today?</p>
        </div>
        
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/10">
          <span>How are you feeling?</span>
          <span className="text-2xl">🌙</span>
        </div>
      </div>

      {/* Daily Mix */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-5 h-5 bg-yellow-400 rounded"></div>
          <h2 className="text-2xl font-semibold">Tonight's Mix</h2>
        </div>
        
        <div className="glass p-8 rounded-3xl flex gap-8 items-center">
          <img 
            src="https://picsum.photos/id/1015/280/280" 
            alt="Tonight Mix" 
            className="w-64 h-64 rounded-2xl shadow-2xl"
          />
          <div>
            <p className="text-purple-400 text-sm tracking-widest">DAILY BLEND</p>
            <h3 className="text-5xl font-bold mt-2 mb-4">Tonight's Mix</h3>
            <p className="text-gray-400 max-w-md">Eight tracks tuned to your Dreamer • Night Owl archetype. Updated 12 minutes ago.</p>
            
            <div className="flex gap-4 mt-8">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-white text-black px-10 py-4 rounded-full font-semibold flex items-center gap-3"
              >
                <Play fill="black" /> Play
              </motion.button>
              <button className="border border-white/30 px-8 py-4 rounded-full hover:bg-white/5">Shuffle</button>
            </div>
          </div>
        </div>
      </div>

      {/* Made for you */}
      <div>
        <h2 className="text-3xl font-semibold mb-6">Made for you tonight</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {playlists.map((pl, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="glass rounded-3xl overflow-hidden cursor-pointer group"
            >
              <img src={pl.image} className="w-full aspect-square object-cover" />
              <div className="p-5">
                <p className="font-semibold">{pl.title}</p>
                <p className="text-sm text-gray-400">{pl.artist}</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition">
                  <button className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center">
                    <Play fill="black" size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}