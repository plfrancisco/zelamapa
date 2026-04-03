import { useState } from "react";
import { 
  ArrowLeft,
  Clock,
  MapPin, 
  Navigation, 
  CheckCircle, 
  Home
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Collection {
  id: number;
  address: string;
  wasteType: string;
  photoUrl: string;
  status: "pending" | "completed";
  lat: number;
  lng: number;
}

const mockCollections: Collection[] = [
  {
    id: 1,
    address: "Rua das Flores, 123 - Centro",
    wasteType: "Entulho de Obra",
    photoUrl: "https://images.unsplash.com/photo-1653202143301-7fb80a90010c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3YXN0ZSUyMGRlYnJpc3xlbnwxfHx8fDE3NzUwOTIyMjJ8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "completed",
    lat: -22.102,
    lng: -50.176,
  },
  {
    id: 2,
    address: "Av. Brasil, 456 - Jardim Alvorada",
    wasteType: "Móveis Velhos",
    photoUrl: "https://images.unsplash.com/photo-1772057593098-edb9b9429059?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBmdXJuaXR1cmUlMjBkaXNwb3NhbHxlbnwxfHx8fDE3NzUwOTIyMjN8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: -22.106,
    lng: -50.170,
  },
  {
    id: 3,
    address: "Rua São Paulo, 789 - Vila Nova",
    wasteType: "Poda de Árvores",
    photoUrl: "https://images.unsplash.com/photo-1764173038986-9d1261cd01a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHdhc3RlJTIwZ2FyZGVuJTIwcHJ1bmluZ3xlbnwxfHx8fDE3NzUwOTIyMjJ8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: -22.110,
    lng: -50.178,
  },
  {
    id: 4,
    address: "Rua Minas Gerais, 321 - São José",
    wasteType: "Entulho de Obra",
    photoUrl: "https://images.unsplash.com/photo-1653202143301-7fb80a90010c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3YXN0ZSUyMGRlYnJpc3xlbnwxfHx8fDE3NzUwOTIyMjJ8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: -22.115,
    lng: -50.165,
  },
  {
    id: 5,
    address: "Av. Independência, 654 - Centro",
    wasteType: "Móveis Velhos",
    photoUrl: "https://images.unsplash.com/photo-1772057593098-edb9b9429059?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBmdXJuaXR1cmUlMjBkaXNwb3NhbHxlbnwxfHx8fDE3NzUwOTIyMjN8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: -22.100,
    lng: -50.160,
  },
];

export default function DriverApp({ onLogout }: { onLogout: () => void }) {
  const [collections, setCollections] = useState(mockCollections);
  const currentCollection = collections.find((c) => c.status === "pending");
  const completedCount = collections.filter((c) => c.status === "completed").length;
  const totalCount = collections.length;

  const handleCompleteCollection = () => {
    if (!currentCollection) return;
    
    setCollections((prev) =>
      prev.map((c) =>
        c.id === currentCollection.id ? { ...c, status: "completed" } : c
      )
    );
  };

  return (
    <div className="dark h-screen bg-[#0f1419] text-white overflow-hidden relative">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
            <Button onClick={onLogout} variant="ghost" size="icon" className="text-white hover:bg-white/20 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2DCE89]" />
              <span className="text-sm">~45 min</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#2DCE89]" />
              <span className="text-sm">{completedCount}/{totalCount}</span>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Map Area */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[-22.1062, -50.1740]} zoom={14} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles-dark"
          />
          <Polyline 
            positions={collections.map(c => [c.lat, c.lng] as [number, number])} 
            pathOptions={{ color: '#2DCE89', weight: 4, dashArray: '5, 10' }} 
          />

          {collections.map((collection, index) => {
            const iconHtml = collection.status === "completed" 
              ? `<div class="w-10 h-10 rounded-full bg-[#2DCE89] border-4 border-white flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>`
              : `<div class="relative"><div class="absolute inset-0 w-10 h-10 rounded-full bg-[#2DCE89] animate-ping opacity-30"></div><div class="relative w-10 h-10 rounded-full bg-[#2DCE89] border-4 border-white flex items-center justify-center shadow-lg"><span class="text-white font-bold" style="font-family: sans-serif;">${index + 1}</span></div></div>`;
            
            const icon = L.divIcon({
              className: 'custom-driver-icon',
              html: iconHtml,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });

            return (
              <Marker key={collection.id} position={[collection.lat, collection.lng]} icon={icon}>
                <Popup>
                  <div className="font-semibold text-gray-800">${collection.address.split(" - ")[0]}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Custom CSS for dark map tiles (optional, but looks better in dark mode App) */}
        <style dangerouslySetInnerHTML={{__html: `
          .map-tiles-dark {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
          }
        `}} />
      </div>

      {/* Bottom Card */}
      {currentCollection ? (
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
          <Card className="bg-[#1a1f2e] border-gray-700 shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Photo Thumbnail */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-inner">
                  <img
                    src={currentCollection.photoUrl}
                    alt="Waste photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white truncate font-semibold text-lg">
                        {currentCollection.address}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-400 truncate">
                          Próxima coleta
                        </p>
                      </div>
                    </div>
                  </div>

                  <Badge className="bg-[#2DCE89]/20 text-[#2DCE89] border-[#2DCE89]/30 hover:bg-[#2DCE89]/30 mt-1">
                    {currentCollection.wasteType}
                  </Badge>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleCompleteCollection}
                className="w-full mt-5 bg-[#2DCE89] hover:bg-[#25b377] text-white h-14 text-base shadow-lg shadow-[#2DCE89]/20 font-bold rounded-xl transition-all cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 mr-3" />
                Concluir Coleta
              </Button>

              {/* Progress Indicator */}
              <div className="mt-5 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span className="font-medium">Progresso da Rota</span>
                  <span className="font-bold text-white">{completedCount} de {totalCount}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#209a65] to-[#2DCE89] h-2.5 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(45,206,137,0.5)]"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
          <Card className="bg-[#1a1f2e] border-gray-700 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-[#2DCE89]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle className="w-12 h-12 text-[#2DCE89]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Rota Concluída!</h3>
              <p className="text-gray-400 mb-6">
                Todas as coletas foram finalizadas com sucesso. Bom trabalho!
              </p>
                <Button onClick={onLogout} className="bg-[#2DCE89] hover:bg-[#25b377] text-white w-full h-12 text-lg font-semibold rounded-xl cursor-pointer">
                  Encerrar Turno
                </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
