import {
  TrendingUp,
  AlertCircle,
  Loader2,
  Map as MapIcon,
  Maximize2,
  Trash2,
  Box,
  Truck,
  User,
  UserPlus,
  ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

// Fix para ícones do Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DashboardStats {
  recentCollections: any[];
  activeTrucks: any[];
  wasteCategories: any[];
  neighborhoodData: any[];
  intelligence: {
    avgResolutionTime: number;
    weeklyCount: number;
    criticalScore: number;
  };
}

// ============================================
// VIEW: MAPA DE CALOR
// ============================================
export function HeatmapView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ocorrencias/dashboard-stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Erro dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const filteredCollections = useMemo(() => {
    if (!stats) return [];
    return activeFilter === "Todos" 
      ? stats.recentCollections 
      : stats.recentCollections.filter(c => c.type === activeFilter);
  }, [stats, activeFilter]);

  if (loading || !stats) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#2DCE89] w-10 h-10" /></div>;

  const getIntensityColor = (type: string) => {
    const colors: any = { 'Entulho': '#F5365C', 'Poda': '#2DCE89', 'Móveis': '#5e8cf7' };
    return colors[type] || '#fbbf24';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm border-l-4 border-red-500 relative">
          <CardContent className="p-5">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Zonas Críticas</p>
            <h3 className="text-3xl font-black text-[#1A2B48]">{stats.intelligence.criticalScore}</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm border-l-4 border-[#2DCE89]">
          <CardContent className="p-5">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Tempo Médio OS</p>
            <h3 className="text-3xl font-black text-[#1A2B48]">{stats.intelligence.avgResolutionTime}h</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm border-l-4 border-blue-500">
          <CardContent className="p-5">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Solicitações/Semana</p>
            <h3 className="text-3xl font-black text-[#1A2B48]">{stats.intelligence.weeklyCount}</h3>
          </CardContent>
        </Card>
        <Card className="bg-[#1A2B48] border-none shadow-sm text-white">
          <CardContent className="p-5">
            <p className="text-[10px] text-white/40 font-black uppercase mb-1">Volume Previsto</p>
            <h3 className="text-3xl font-black text-[#2DCE89]">{Math.round(filteredCollections.length * 1.8)} m³</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden bg-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
            <div className="flex items-center gap-3">
              <MapIcon className="text-[#2DCE89]" size={18} />
              <CardTitle className="text-[#1A2B48] text-base font-black">Inteligência Geográfica</CardTitle>
            </div>
            <div className="flex gap-2">
              {["Todos", "Entulho", "Poda", "Móveis"].map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${activeFilter === f ? 'bg-[#2DCE89] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {f}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 relative">
            <div style={{ height: "550px", zIndex: 0 }}>
              <MapContainer center={[-22.1062, -50.1740]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {filteredCollections.map((item) => (
                  <Circle
                    key={item.id}
                    center={[item.latitude, item.longitude]}
                    radius={150}
                    pathOptions={{ fillColor: getIntensityColor(item.type), fillOpacity: 0.5, color: 'white', weight: 1.5 }}
                  >
                    <Popup>
                      <div className="w-48">
                        <p className="text-[9px] font-black uppercase text-red-500 mb-1">{item.type}</p>
                        <h4 className="text-sm font-black text-[#1A2B48] leading-tight mb-1">{item.endereco}</h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{item.descricao}</p>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white rounded-3xl">
          <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Bairros Críticos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.neighborhoodData.slice(0, 5).map((n, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] mb-2 font-bold">
                    <span>{n.name}</span>
                    <span className="text-[#2DCE89]">{n.value} ptos</span>
                  </div>
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-[#2DCE89]`} style={{ width: `${(n.value / (stats.recentCollections.length || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// VIEW: ROTAS ATIVAS
// ============================================
export function ActiveRoutesView() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${API_BASE}/api/ocorrencias/dashboard-stats`);
      if (response.ok) {
        const data = await response.json();
        setTrucks(data.activeTrucks || []);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const getTruckIcon = (status: string) => {
    const color = status === 'EM_ROTA' ? '#5e8cf7' : '#2DCE89';
    return L.divIcon({
      className: 'custom-truck',
      html: `<div style="background: ${color}; border: 3px solid white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.4)">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" stroke-width="2.5" fill="none"><path d="M10 17h4V5H2v12h3m1-7h2.5m1 7h-1m1-9h5m-11 9a2 2 0 1 0 4 0 2 2 0 1 0-4 0m11 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-2xl overflow-hidden bg-white rounded-3xl">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
           <div className="flex items-center gap-3">
             <Truck size={18} className="text-blue-500" />
             <CardTitle className="text-base font-black text-[#1A2B48]">Monitoramento de Frota</CardTitle>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: "550px" }}>
            <MapContainer center={[-22.1062, -50.1740]} zoom={14} style={{ height: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {trucks.filter(t => t.latitude).map((truck) => (
                <Marker key={truck.motorista_id} position={[truck.latitude, truck.longitude]} icon={getTruckIcon(truck.disponibilidade)}>
                  <Popup>
                    <div className="p-2">
                      <p className="text-xs font-black text-[#1A2B48]">{truck.driver_name}</p>
                      <Badge className="text-[8px] bg-[#2DCE89] border-none uppercase">{truck.disponibilidade}</Badge>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100"><CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Operadores On-line</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {trucks.map(t => (
              <div key={t.motorista_id} className="p-5 flex items-center justify-between">
                <span className="text-sm font-black text-[#1A2B48]">{t.driver_name}</span>
                <Badge variant={t.disponibilidade === 'EM_ROTA' ? 'default' : 'outline'}>{t.disponibilidade}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// VIEW: CONFIGURAÇÕES
// ============================================
export function SettingsView() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", papel: "MOTORISTA", truck: "" });
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchDrivers = async () => {
    const res = await fetch(`${API_BASE}/api/auth/usuarios?papel=MOTORISTA`);
    if (res.ok) {
      const data = await res.json();
      setDrivers(data.usuarios);
    }
  };

  useEffect(() => { fetchDrivers() }, []);

  const handleAddUser = async () => {
    if(!newUser.name || !newUser.email || !newUser.password) return alert("Preencha tudo!");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: newUser.name, email: newUser.email, senha: newUser.password, papel: newUser.papel, caminhao_id: newUser.truck })
      });
      if (res.ok) {
        toast.success("Operador cadastrado!");
        setNewUser({ name: "", email: "", password: "", papel: "MOTORISTA", truck: "" });
        fetchDrivers();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Deletar?")) {
      await fetch(`${API_BASE}/api/auth/usuarios/${id}`, { method: "DELETE" });
      fetchDrivers();
      toast.error("Removido");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-[#1A2B48] text-white p-6"><CardTitle className="text-base font-black uppercase tracking-widest">Gestão de Operadores</CardTitle></CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 bg-gray-50 p-6 rounded-2xl">
            <Input placeholder="Nome" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            <Input placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            <Input type="password" placeholder="Senha" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <Button onClick={handleAddUser} disabled={loading} className="bg-[#2DCE89] font-black uppercase tracking-widest rounded-xl">
              {loading ? "..." : "Criar Conta"}
            </Button>
          </div>
          <div className="space-y-3">
            {drivers.map(d => (
              <div key={d.id} className="flex justify-between items-center p-5 border border-gray-100 rounded-2xl bg-white">
                <div><p className="font-black text-[#1A2B48]">{d.nome}</p><p className="text-[11px] text-gray-400">{d.email}</p></div>
                <Button variant="ghost" onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
