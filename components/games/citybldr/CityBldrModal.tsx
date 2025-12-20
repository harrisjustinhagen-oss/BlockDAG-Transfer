import React, { useRef, useEffect, useState, lazy, Suspense } from "react";
import Globe from "react-globe.gl";

const UE5PixelStream = lazy(() => import("./UE5PixelStream").then(m => ({ default: m.UE5PixelStream })));

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: () => void;
};

type City = {
  lat: number;
  lng: number;
  name: string;
  size: number;
  color: string;
};

export const CityBldrModal: React.FC<Props> = ({ isOpen, onClose, onLaunch }) => {
  const globeRef = useRef<any>(null);
  const [userCity, setUserCity] = useState<City | null>(null);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showUE5, setShowUE5] = useState(false);
  
  const ue5Enabled = import.meta.env.VITE_UE5_ENABLED === "true";
  const ue5ServerUrl = import.meta.env.VITE_UE5_SERVER_URL || "ws://localhost:8888";

  useEffect(() => {
    if (!isOpen) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCity({ lat, lng, name: localStorage.getItem("username") || "Player", size: 0.8, color: "#f59e0b" });
          setTimeout(() => {
            if (globeRef.current && globeRef.current.pointOfView) {
              globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 1500);
            }
          }, 500);
        },
        () => {
          const defaultLat = 39.8283;
          const defaultLng = -98.5795;
          setUserCity({ lat: defaultLat, lng: defaultLng, name: localStorage.getItem("username") || "Player", size: 0.8, color: "#f59e0b" });
          setTimeout(() => {
            if (globeRef.current && globeRef.current.pointOfView) {
              globeRef.current.pointOfView({ lat: defaultLat, lng: defaultLng, altitude: 1.5 }, 1500);
            }
          }, 500);
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !globeRef.current) return;
    setTimeout(() => {
      if (globeRef.current && globeRef.current.pointOfView) {
        globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0);
      }
    }, 100);
  }, [isOpen]);

  const handleCityClick = (city: City, event: any) => {
    setShowCityMenu(true);
    setMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const handleLaunchUE5 = () => {
    setShowUE5(true);
    setShowCityMenu(false);
  };

  if (showUE5 && ue5Enabled) {
    return (
      <Suspense fallback={<div className="fixed inset-0 z-50 bg-black flex items-center justify-center"><div className="text-white text-xl">Loading UE5...</div></div>}>
        <UE5PixelStream serverUrl={ue5ServerUrl} onClose={() => setShowUE5(false)} />
      </Suspense>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-700 rounded-xl p-4 z-50 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-2xl text-white">City BLDR  Interactive Earth</h3>
            {ue5Enabled && <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">UE5 Ready</span>}
          </div>
          <button className="px-3 py-2 rounded bg-slate-800/60 hover:bg-slate-700 text-white" onClick={onClose}>Close</button>
        </div>

        <div className="flex-1 bg-gradient-to-b from-slate-950 to-black rounded overflow-hidden border border-slate-700 relative">
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            atmosphereColor="lightskyblue"
            atmosphereAltitude={0.15}
            animateIn={true}
            waitForGlobeReady={true}
            rendererConfig={{ antialias: true, alpha: true }}
            htmlElementsData={userCity ? [userCity] : []}
            htmlElement={(d: any) => {
              const el = document.createElement("div");
              el.innerHTML = `<div style="cursor: pointer; text-align: center;"><div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"></div><div style="font-size: 11px; font-weight: bold; color: #fbbf24; text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(251,191,36,0.6); margin-top: 2px;">${d.name}'s Village</div></div>`;
              el.style.pointerEvents = "auto";
              el.addEventListener("click", (event) => { event.stopPropagation(); handleCityClick(d, event); });
              return el;
            }}
          />
          
          {showCityMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCityMenu(false)} />
              <div className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-3 min-w-[200px]" style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px`, transform: "translate(-50%, 10px)" }}>
                <div className="text-white font-bold mb-2 text-sm border-b border-slate-600 pb-2">{userCity?.name}'s Village</div>
                <div className="flex flex-col gap-1">
                  <button className="px-3 py-2 text-left text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors" onClick={() => { alert(`Village Info:\nLocation: ${userCity?.lat.toFixed(4)}, ${userCity?.lng.toFixed(4)}\nOwner: ${userCity?.name}`); setShowCityMenu(false); }}>? View Info</button>
                  <button className="px-3 py-2 text-left text-sm bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold transition-colors" onClick={() => { onLaunch(); onClose(); }}> BLD (Basic)</button>
                  {ue5Enabled && <button className="px-3 py-2 text-left text-sm bg-purple-600 hover:bg-purple-500 text-white rounded font-semibold transition-colors" onClick={handleLaunchUE5}> BLD (UE5)</button>}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-3 text-sm text-slate-300 text-center"> Drag   Scroll   Click village</div>
      </div>
    </div>
  );
};

export default CityBldrModal;
