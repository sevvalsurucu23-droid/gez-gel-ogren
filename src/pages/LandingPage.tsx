import { Link } from "react-router-dom";
import { Compass, Map as MapIcon, Navigation } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5a5a40 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000 z-10">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-[#5a5a40] rounded-2xl flex items-center justify-center shadow-lg border border-[#5a5a40]/20 transform rotate-3 hover:rotate-0 transition-transform">
            <Compass className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#3d3d2b]" style={{ fontFamily: '"Georgia", serif' }}>
          Gez Gel <span className="text-[#5a5a40] italic">Öğren</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[#1a1a1a]/70 font-medium max-w-2xl mx-auto leading-relaxed">
          İstanbul'un tarihi ve kültürel zenginliklerini harita üzerinde keşfedin. Adım adım gezin, görün ve öğrenin.
        </p>

        <div className="pt-8">
          <Link 
            to="/map" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#5a5a40] hover:bg-[#4a4a30] text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl shadow-[#5a5a40]/20"
          >
            <MapIcon className="w-6 h-6" />
            Haritayı Aç
            <Navigation className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[#5a5a40]/60 text-xs font-bold uppercase tracking-widest text-center w-full">
        Veriler OpenStreetMap ve Google Sheets Birlikteliğiyle Sağlanmaktadır
      </div>
    </div>
  );
}
