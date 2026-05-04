import papaparse from "papaparse";

export interface PlaceData {
  Adı: string;
  "Mekan Türü": string;
  "İlçe Adı": string;
  "Açılış Yılı"?: string;
  Adres: string;
  Telefon?: string;
  "Çalışma Saatleri"?: string;
  Medya?: string;
  lat?: number;
  lng?: number;
}

const CACHE_KEY = "geocoder_cache_v2";

export function getCache(): Record<string, { lat: number; lng: number }> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

export function setCache(cache: Record<string, { lat: number; lng: number }>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("Failed to save cache", e);
  }
}

export async function geocodeAddress(address: string, district: string, name: string): Promise<{ lat: number; lng: number } | null> {
  const cache = getCache();
  
  // Hardcoded coordinates for most robust loading of main landmarks
  const STATIC_COORDS: Record<string, { lat: number; lng: number }> = {
    "Ayasofya": { lat: 41.0085, lng: 28.9799 },
    "Sultanahmet Camii": { lat: 41.0054, lng: 28.9768 },
    "Topkapı Sarayı": { lat: 41.0115, lng: 28.9833 },
    "Yerebatan Sarnıcı": { lat: 41.0084, lng: 28.9779 },
    "Kapalıçarşı": { lat: 41.0106, lng: 28.9680 },
    "Süleymaniye Camii": { lat: 41.0162, lng: 28.9638 },
    "Dolmabahçe Sarayı": { lat: 41.0396, lng: 28.9995 },
    "Galata Kulesi": { lat: 41.0256, lng: 28.9741 },
    "Ortaköy Meydanı": { lat: 41.0478, lng: 29.0270 },
    "Çamlıca Tepesi": { lat: 41.0264, lng: 29.0684 },
    "Pierre Loti Tepesi": { lat: 41.0540, lng: 28.9340 },
    "Rumeli Hisarı": { lat: 41.0838, lng: 29.0528 },
    "Anadolu Hisarı": { lat: 41.0837, lng: 29.0673 },
    "Bebek Sahili": { lat: 41.0772, lng: 29.0435 },
    "Kız Kulesi": { lat: 41.0211, lng: 29.0041 },
    "İstanbul Modern": { lat: 41.0266, lng: 28.9818 },
    "Pera Müzesi": { lat: 41.0318, lng: 28.9750 },
    "Sakıp Sabancı Müzesi": { lat: 41.1068, lng: 29.0553 },
    "Rahmi Koç Müzesi": { lat: 41.0431, lng: 28.9493 },
    "Arter": { lat: 41.0366, lng: 28.9789 },
    "Balat": { lat: 41.0315, lng: 28.9463 },
    "Fener": { lat: 41.0305, lng: 28.9515 },
    "Karaköy": { lat: 41.0232, lng: 28.9760 },
    "Kadıköy": { lat: 40.9902, lng: 29.0239 },
    "Moda": { lat: 40.9795, lng: 29.0253 },
    "Cihangir": { lat: 41.0316, lng: 28.9816 },
    "Nişantaşı": { lat: 41.0518, lng: 28.9918 },
    "Belgrad Ormanı": { lat: 41.1891, lng: 28.9566 },
    "Emirgan Korusu": { lat: 41.1078, lng: 29.0505 },
    "Yıldız Parkı": { lat: 41.0454, lng: 29.0135 },
    "Atatürk Arboretumu": { lat: 41.1717, lng: 28.9822 },
    "Polonezköy": { lat: 41.1114, lng: 29.2131 },
  };

  // Check hardcoded first
  for (const [key, coords] of Object.entries(STATIC_COORDS)) {
    if (name.includes(key)) {
      return coords;
    }
  }

  // Then check cache
  const cleanAddress = address.replace(/, Türkiye/g, '').replace(/, Turkey/g, '');
  const cleanName = name.split('(')[0].trim().replace(/Müzesi|Camii|Sarnıcı/g, '');

  const queries = [
    `${name}, Istanbul`,
    `${cleanName}, ${district}, Istanbul`,
    `${district}, Istanbul`
  ];
  
  for (const searchString of queries) {
    if (cache[searchString]) {
       return cache[searchString];
    }
  }

  // Then call Nominatim API with email to respect policies
  for (const searchString of queries) {
    try {
      // Basic rate limiting for Nominatim (1 request per second)
      // Including email in URL reduces chance of being blocked
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchString)}&format=json&limit=1&email=contact@gezgelogren.com`;
      
      const response = await fetch(url, { 
        headers: { 
          'Accept-Language': 'tr'
        } 
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        
        cache[searchString] = result;
        cache[`${name}-${district}`] = result;
        setCache(cache);
        
        // Wait 1 second to respect nominatim API policy limits
        await new Promise(r => setTimeout(r, 1000));
        return result;
      }
      
      // Wait to respect rate limits even on failures
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error("Geocoding error for", searchString, error);
    }
  }
  
  return null;
}

export async function fetchCSVData(): Promise<PlaceData[]> {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSf7D1lEnEk6PDJ50LpWscyd2K244n1-G167rgnrFbhJnSyvr1aGEbkGM_ljQ1iEGt71dU5MmY8Vooi/pub?output=csv";
  
  try {
    const response = await fetch(url);
    const csvContent = await response.text();
    
    const result = papaparse.parse<PlaceData>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    return result.data;
  } catch (error) {
    console.error("Failed to fetch CSV", error);
    return [];
  }
}

