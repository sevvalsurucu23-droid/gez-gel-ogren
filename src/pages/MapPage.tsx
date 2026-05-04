import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { MapPin, ArrowLeft, Loader2, Phone, Map as MapIcon, Clock } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import { fetchCSVData, geocodeAddress, PlaceData } from "../utils/geocoder";

// Fix Leaflet's default icon path issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A custom beautifully styled marker
const createCustomIcon = (type: string, name: string) => {
  const typeLower = type.toLowerCase();
  const nameLower = name.toLowerCase();
  
  let innerBg = "bg-[#5a5a40]";
  let outerBorder = "border-[#5a5a40]";
  let svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`; // MapPin

  if (typeLower.includes("cami") || typeLower.includes("kilise") || typeLower.includes("ibadethane") || nameLower.includes("cami") || nameLower.includes("kilise")) {
    innerBg = "bg-[#4a5d23]";
    outerBorder = "border-[#4a5d23]/80";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`; // Moon
  } else if (typeLower.includes("müze") || nameLower.includes("müze")) {
    innerBg = "bg-[#6b4c4c]";
    outerBorder = "border-[#6b4c4c]/80";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`; // Landmark
  } else if (typeLower.includes("saray") || typeLower.includes("kasır") || nameLower.includes("saray") || nameLower.includes("kasır")) {
    innerBg = "bg-[#6b5835]";
    outerBorder = "border-[#6b5835]/80";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-9h-4v9"/><path d="M6 20v-9H2v9"/><path d="M22 11V3h-4v4h-2V3h-4v4H6V3H2v8"/><path d="M2 20h20"/><path d="M10 20v-5a2 2 0 0 1 4 0v5"/></svg>`; // Castle
  } else if (typeLower.includes("çarşı") || typeLower.includes("pazar") || typeLower.includes("pasaj") || nameLower.includes("çarşı")) {
    innerBg = "bg-[#804b38]";
    outerBorder = "border-[#804b38]/80";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`; // ShoppingBag
  } else if (typeLower.includes("park") || typeLower.includes("koru") || typeLower.includes("doğa") || typeLower.includes("orman") || nameLower.includes("park") || nameLower.includes("koru") || nameLower.includes("orman")) {
    innerBg = "bg-[#386b46]";
    outerBorder = "border-[#386b46]/80";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20a14.15 14.15 0 0 1 0-16 14.15 14.15 0 0 1 11.23 6.07 14.15 14.15 0 0 1-11.23 9.93Z"/><path d="M11 20c-5.2-1.7-8-6.4-8-12.02"/></svg>`; // Leaf
  } else if (typeLower.includes("meydan") || typeLower.includes("semt") || typeLower.includes("sokak") || typeLower.includes("sahil") || nameLower.includes("meydan") || nameLower.includes("sahil") || nameLower.includes("tepesi")) {
    innerBg = "bg-[#546b6b]";
    outerBorder = "border-[#546b6b]/80";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`; // Camera
  }
                    
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="w-9 h-9 bg-white p-[3px] rounded-full shadow-lg border-2 ${outerBorder} transform hover:scale-110 transition-transform">
            <div class="w-full h-full ${innerBg} rounded-full flex items-center justify-center text-white">
              ${svgIcon}
            </div>
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

export default function MapPage() {
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      const data = await fetchCSVData();
      if (!isMounted) return;
      
      setTotal(data.length);
      
      // We process geocoding sequentially so we don't bombard the API
      // If cached, it resolves instantly
      const processedPlaces: PlaceData[] = [];
      
      for (let i = 0; i < data.length; i++) {
        const place = data[i];
        if (place.Adres && place["İlçe Adı"]) {
          const coords = await geocodeAddress(place.Adres, place["İlçe Adı"], place.Adı);
          if (coords) {
            place.lat = coords.lat;
            place.lng = coords.lng;
            processedPlaces.push(place);
            // Update state incrementally so map populates
            if (isMounted) {
               setPlaces([...processedPlaces]);
               setProgress(i + 1);
            }
          }
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-[#e0dfd5] text-[#1a1a1a] relative">
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-4">
        <Link 
          to="/" 
          className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-[#5a5a40]/10 text-[#5a5a40] hover:text-[#3d3d2b] hover:bg-white transition-all transform hover:scale-105 flex items-center gap-2"
          title="Ana Sayfa"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide">Geri Dön</span>
        </Link>
        
        {loading && (
          <div className="bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-[#5a5a40]/10 flex items-center gap-4 animate-in slide-in-from-left">
            <Loader2 className="w-5 h-5 text-[#5a5a40] animate-spin" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#3d3d2b]">Harita Yükleniyor</span>
              <span className="text-xs text-[#5a5a40]/70 font-medium italic">{progress} / {total} Konum</span>
            </div>
            <div className="w-32 h-2 bg-[#f5f5f0] rounded-full ml-4 overflow-hidden border border-[#5a5a40]/5">
              <div 
                className="h-full bg-[#5a5a40] transition-all duration-300 rounded-full" 
                style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <MapContainer 
        center={[41.0082, 28.9784]} // Default Istanbul
        zoom={12} 
        className="flex-1 w-full z-0 font-sans"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {places.map((place, idx) => {
          if (!place.lat || !place.lng) return null;
          
          return (
            <Marker 
              key={idx} 
              position={[place.lat, place.lng]}
              icon={createCustomIcon(place["Mekan Türü"] || "", place.Adı || "")}
            >
              <Tooltip 
                direction="top" 
                offset={[0, -20]} 
                opacity={1}
                className="custom-tooltip border-0 shadow-none font-sans"
              >
                <div className="px-3 py-1.5 bg-[#5a5a40] shadow-md border border-[#ffffff]/20 rounded-xl text-white min-w-[120px]">
                  <h3 className="font-bold text-xs tracking-tight">{place.Adı}</h3>
                  <div className="text-[10px] text-white/80 mt-0.5 flex items-center gap-1 italic">
                    <MapPin className="w-2.5 h-2.5" />
                    {place["İlçe Adı"]}
                  </div>
                </div>
              </Tooltip>
              <Popup className="custom-popup" maxWidth={320}>
                <div className="p-2">
                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-1 bg-[#f5f5f0] text-[#5a5a40] text-[10px] font-bold rounded-full uppercase tracking-tighter mb-2 border border-[#5a5a40]/10">
                      {place["Mekan Türü"] || "Tarihi Yer"}
                    </span>
                    <h2 className="text-lg font-bold text-[#3d3d2b] leading-tight mt-1 font-sans">
                      {place.Adı}
                    </h2>
                  </div>
                  
                  <div className="space-y-3 mt-4 text-xs font-medium">
                    <div className="flex items-start gap-3 text-[#5a5a40]">
                      <MapIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
                      <p className="leading-relaxed">{place.Adres}</p>
                    </div>
                    
                    {place.Telefon && (
                      <div className="flex items-center gap-3 text-[#5a5a40]">
                        <Phone className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <a href={`tel:${place.Telefon.replace(/[^0-9+]/g, '')}`} className="hover:text-[#3d3d2b] hover:font-bold underline decoration-[#5a5a40]/30 transition-all font-mono">
                          {place.Telefon}
                        </a>
                      </div>
                    )}
                    
                    {place["Çalışma Saatleri"] && (
                      <div className="flex items-start gap-3 text-[#5a5a40]">
                        <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70" />
                        <p>{place["Çalışma Saatleri"]}</p>
                      </div>
                    )}
                  </div>
                  
                  {place.Medya && (
                     <div className="mt-5 pt-3 border-t border-[#f5f5f0]">
                        <a 
                          href={place.Medya} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full py-2 bg-[#5a5a40] hover:bg-[#4a4a30] text-white text-center rounded-lg font-semibold transition-all text-xs shadow-md"
                        >
                          Medyayı Görüntüle
                        </a>
                     </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
