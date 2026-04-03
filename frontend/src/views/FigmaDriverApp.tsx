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
    lat: 30,
    lng: 25,
  },
  {
    id: 2,
    address: "Av. Brasil, 456 - Jardim Alvorada",
    wasteType: "Móveis Velhos",
    photoUrl: "https://images.unsplash.com/photo-1772057593098-edb9b9429059?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBmdXJuaXR1cmUlMjBkaXNwb3NhbHxlbnwxfHx8fDE3NzUwOTIyMjN8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: 45,
    lng: 40,
  },
  {
    id: 3,
    address: "Rua São Paulo, 789 - Vila Nova",
    wasteType: "Poda de Árvores",
    photoUrl: "https://images.unsplash.com/photo-1764173038986-9d1261cd01a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHdhc3RlJTIwZ2FyZGVuJTIwcHJ1bmluZ3xlbnwxfHx8fDE3NzUwOTIyMjJ8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: 60,
    lng: 55,
  },
  {
    id: 4,
    address: "Rua Minas Gerais, 321 - São José",
    wasteType: "Entulho de Obra",
    photoUrl: "https://images.unsplash.com/photo-1653202143301-7fb80a90010c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3YXN0ZSUyMGRlYnJpc3xlbnwxfHx8fDE3NzUwOTIyMjJ8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: 75,
    lng: 70,
  },
  {
    id: 5,
    address: "Av. Independência, 654 - Centro",
    wasteType: "Móveis Velhos",
    photoUrl: "https://images.unsplash.com/photo-1772057593098-edb9b9429059?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBmdXJuaXR1cmUlMjBkaXNwb3NhbHxlbnwxfHx8fDE3NzUwOTIyMjN8MA&ixlib=rb-4.1.0&q=80&w=400",
    status: "pending",
    lat: 85,
    lng: 30,
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Route line connecting all points */}
          <path
            d={`M ${collections[0].lng} ${collections[0].lat} ${collections
              .slice(1)
              .map((c) => `L ${c.lng} ${c.lat}`)
              .join(" ")}`}
            stroke="#2DCE89"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2,1"
            opacity="0.8"
          />
        </svg>

        {/* Location Pins */}
        {collections.map((collection, index) => (
          <div
            key={collection.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{
              left: `${collection.lng}%`,
              top: `${collection.lat}%`,
            }}
          >
            <div className="relative group">
              {collection.status === "completed" ? (
                <div className="w-10 h-10 rounded-full bg-[#2DCE89] border-4 border-white/30 flex items-center justify-center shadow-lg cursor-pointer">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="relative cursor-pointer">
                  <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#2DCE89] animate-ping opacity-30"></div>
                  <div className="relative w-10 h-10 rounded-full bg-[#2DCE89] border-4 border-white flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                </div>
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                  {collection.address.split(" - ")[0]}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Grid overlay for map texture */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
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
