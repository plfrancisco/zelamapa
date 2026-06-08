import {
  TrendingUp,
  AlertCircle,
  Loader2,
  Map as MapIcon,
  Trash2,
  Box,
  Truck,
  PieChart as PieIcon,
  BarChart3,
  Sun,
  Award,
  Zap,
  DollarSign,
  Clock,
  CheckCircle2,
  Settings,
  Search,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { socketService } from "../api/socketService";
import { getAuthHeaders } from "../api/authService";

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
  statusDistribution: any[];
  dailyTrend: any[];
  intelligence: {
    avgResolutionTime: number;
    weeklyCount: number;
    criticalScore: number;
    resolutionRate: number;
    avgRating: number;
    totalOperationalCost: number;
    gasPrice: number;
  };
}

// ============================================
// VIEW: RELATÓRIOS BI (BUSINESS INTELLIGENCE)
// ============================================
export function ReportsBIView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_BASE}/api/bi/summary`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Erro BI:", err));
  }, [API_BASE]);

  if (loading || !data) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8be9fd] w-10 h-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER BI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-gradient-to-br from-[#8be9fd] to-[#2dcecc] text-white rounded-[32px]">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Custo Médio / Ordem</p>
                <h3 className="text-4xl font-black">R$ {data.globalMetrics.avgCostPerOrder.toFixed(2)}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl"><Zap size={24} /></div>
            </div>
            <p className="text-[10px] font-bold mt-4 uppercase opacity-70">Eficiência logística baseada em KM real</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-[#111C44] rounded-[32px]">
          <CardContent className="p-8">
            <div className="flex justify-between items-start text-[#1A2B48] dark:text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Combustível (Ref)</p>
                <h3 className="text-3xl font-black">R$ {data.globalMetrics.gasPrice.toFixed(2)}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500"><DollarSign size={24} /></div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black text-[#8be9fd] bg-[#8be9fd]/10 px-2 py-1 rounded-md">POMPÉIA-SP</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-[#1A2B48] dark:bg-black text-white rounded-[32px]">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">TMA Médio Frota</p>
                <h3 className="text-3xl font-black">
                  {Math.round(data.globalMetrics.avgFleetTma || 0)} 
                  <span className="text-sm opacity-40 ml-1">min</span>
                </h3>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl text-white"><Clock size={24} /></div>
            </div>
            <p className="text-[10px] font-bold mt-4 uppercase text-[#8be9fd]">
              {data.globalMetrics.avgFleetTma < 60 ? "Alta Performance Detectada" : "Análise de Gargalos Necessária"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RANKING DE MOTORISTAS */}
        <Card className="border-none shadow-2xl bg-white dark:bg-[#111C44] rounded-[40px] overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 dark:border-white/5 flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between w-full">
              <div>
                <CardTitle className="text-xl font-black text-[#1A2B48] dark:text-white">Scorecard do Operador</CardTitle>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1">Ranking de Produtividade & Jornada</p>
              </div>
              <Award className="text-yellow-400" size={28} />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Filtrar por nome do operador..." 
                className="pl-10 h-11 bg-gray-50 dark:bg-white/5 border-none rounded-2xl font-bold text-sm"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[380px] overflow-hidden hover:overflow-y-auto transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-white/2">
                    <th className="px-8 py-4">Operador</th>
                    <th className="px-4 py-4">Concluídas</th>
                    <th className="px-4 py-4">Tempo Online</th>
                    <th className="px-4 py-4">TMA</th>
                    <th className="px-4 py-4 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {(data.driverScorecard || [])
                    .filter((d: any) => (d.name || "").toLowerCase().includes(nameFilter.toLowerCase()))
                    .map((d: any, i: number) => {
                      const totalMin = d.online_min || 0;
                      const hours = Math.floor(totalMin / 60);
                      const mins = totalMin % 60;
                      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                      return (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center font-black text-[10px]">
                                {(d.name || "?")[0]}
                              </div>
                              <span className="text-sm font-black text-[#1A2B48] dark:text-white">{d.name || "N/A"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5 font-bold text-sm text-gray-500 dark:text-gray-400">{d.total_orders}</td>
                          <td className="px-4 py-5 font-black text-[11px] text-[#2DCE89]">
                            {timeStr}
                          </td>
                          <td className="px-4 py-5">
                            <span className="text-xs font-black text-[#8be9fd]">{Math.round(d.tma_min || 0)} min</span>
                          </td>
                          <td className="px-4 py-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="font-black text-yellow-500">{Number(d.rating || 0).toFixed(1)}</span>
                              <Sun size={12} className="text-yellow-500 fill-yellow-500" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CUSTO POR BAIRRO */}
        <Card className="border-none shadow-2xl bg-white dark:bg-[#111C44] rounded-[40px]">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black text-[#1A2B48] dark:text-white">Análise Financeira (Bairros)</CardTitle>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Gasto total com combustível por zona</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.financialByNeighborhood || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#888'}} width={100} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    formatter={(value: any) => [`R$ ${value}`, 'Custo Estimado']}
                  />
                  <Bar dataKey="value" fill="#8be9fd" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* EFICIÊNCIA DE RESÍDUO */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-white dark:bg-[#111C44] rounded-[40px]">
           <CardHeader className="p-8"><CardTitle className="text-sm font-black uppercase text-gray-400">Eficiência por Categoria</CardTitle></CardHeader>
           <CardContent className="px-8 pb-8 space-y-6">
              {(data.efficiencyByWaste || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-3xl">
                  <div>
                    <p className="text-[10px] font-black text-[#8be9fd] uppercase">{item.name}</p>
                    <p className="text-sm font-black text-[#1A2B48] dark:text-white">R$ {item.avg_cost.toFixed(2)} / coleta</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Volume</p>
                    <p className="text-sm font-black text-[#1A2B48] dark:text-white">{item.total_orders}</p>
                  </div>
                </div>
              ))}
           </CardContent>
        </Card>

        {/* RADAR DE PERFORMANCE GERAL */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-[#111C44] text-white rounded-[40px] overflow-hidden">
           <CardHeader className="p-8 flex flex-row items-center justify-between">
              <div><CardTitle className="text-xl font-black">Radar de Frota</CardTitle><p className="text-xs opacity-40 font-bold uppercase mt-1">Visão holística da operação</p></div>
              <div className="bg-white/10 p-4 rounded-full"><TrendingUp size={24} className="text-[#8be9fd]" /></div>
           </CardHeader>
           <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'Velocidade', A: 80, fullMark: 100 },
                    { subject: 'Satisfação', A: 95, fullMark: 100 },
                    { subject: 'Economia', A: 70, fullMark: 100 },
                    { subject: 'Volume', A: 90, fullMark: 100 },
                    { subject: 'Assiduidade', A: 85, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#ffffff60', fontSize: 10, fontWeight: 'bold'}} />
                    <Radar name="Performance" dataKey="A" stroke="#8be9fd" fill="#8be9fd" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// VIEW: MAPA DE CALOR
// ============================================
export function HeatmapView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  
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
    let filtered = stats.recentCollections;
    
    if (activeFilter !== "Todos") {
      filtered = filtered.filter(c => c.type === activeFilter);
    }
    
    if (statusFilter !== "TODOS") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    return filtered;
  }, [stats, activeFilter, statusFilter]);

  if (loading || !stats) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8be9fd] w-10 h-10" /></div>;

  const getIntensityColor = (type: string) => {
    const colors: any = { 'Entulho': '#F5365C', 'Poda': '#8be9fd', 'Móveis': '#5e8cf7' };
    return colors[type] || '#fbbf24';
  };

  const STATUS_COLORS: any = {
    'PENDENTE': '#F5365C',
    'EM_ANDAMENTO': '#fbbf24',
    'CONCLUIDO': '#8be9fd',
    'CANCELADO': '#adb5bd'
  };

  const createCustomIcon = (type: string, status: string) => {
    const color = getIntensityColor(type);
    const isPendente = status === 'PENDENTE';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container">
          ${isPendente ? `<div class="pulse" style="background-color: ${color}"></div>` : ''}
          <div class="marker-pin" style="background-color: ${color}">
            <div class="marker-inner">
               <svg viewBox="0 0 24 24" width="12" height="12" stroke="white" stroke-width="3" fill="none">
                 ${type === 'Poda' ? '<path d="M12 22v-5M9 7l3 3 3-3M8 13l4 4 4-4M12 10V2"/>' : 
                   type === 'Entulho' ? '<path d="M20 10V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6M4 10h16M21 10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10"/>' :
                   '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'}
               </svg>
            </div>
          </div>
        </div>
        <style>
          .marker-container { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
          .marker-pin { 
            width: 24px; height: 24px; border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); display: flex; align-items: center; 
            justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 2;
          }
          .marker-inner { transform: rotate(45deg); display: flex; align-items: center; justify-content: center; }
          .pulse {
            position: absolute; width: 40px; height: 40px; border-radius: 50%;
            animation: pulse-animation 2s infinite; opacity: 0.6; z-index: 1;
          }
          @keyframes pulse-animation {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        </style>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 24]
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#1A2B48] border-none shadow-sm border-l-4 border-red-500 relative overflow-hidden">
          <CardContent className="p-5">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-wider">Custo Operacional (Pompéia)</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-[#1A2B48] dark:text-white">R$ {stats.intelligence.totalOperationalCost.toLocaleString('pt-BR')}</h3>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">TOTAL</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1A2B48] border-none shadow-sm border-l-4 border-[#8be9fd]">
          <CardContent className="p-5">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-wider">Eficiência Logística</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-[#1A2B48] dark:text-white">{stats.intelligence.resolutionRate}%</h3>
              <TrendingUp size={14} className="text-[#8be9fd]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1A2B48] border-none shadow-sm border-l-4 border-yellow-400">
          <CardContent className="p-5">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-wider">Combustível Ref.</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-[#1A2B48] dark:text-white">R$ {stats.intelligence.gasPrice.toFixed(2)}</h3>
              <span className="text-[10px] font-bold text-gray-400">/ Litro</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2B48] dark:bg-black border-none shadow-sm text-white">
          <CardContent className="p-5">
            <p className="text-[10px] text-white/40 font-black uppercase mb-1 tracking-wider">Volume Mensal Est.</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-[#8be9fd]">{Math.round(stats.intelligence.weeklyCount * 4.3)}</h3>
              <Box className="text-white/20" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden bg-white dark:bg-[#1A2B48] rounded-3xl">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between py-4 px-6 border-b border-gray-50 dark:border-white/5 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#8be9fd]/10 p-2 rounded-xl">
                <MapIcon className="text-[#8be9fd]" size={18} />
              </div>
              <div>
                <CardTitle className="text-[#1A2B48] dark:text-white text-base font-black">Inteligência Geográfica</CardTitle>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Visualização por {activeFilter} & {statusFilter}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full mr-2">
                 {["TODOS", "PENDENTE", "CONCLUIDO"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${statusFilter === s ? 'bg-white dark:bg-white/10 text-[#1A2B48] dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {s}
                  </button>
                 ))}
              </div>
              
              <div className="flex gap-2">
                {["Todos", "Entulho", "Poda", "Móveis"].map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${activeFilter === f ? 'bg-[#8be9fd] text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative">
            <div style={{ height: "550px", zIndex: 0 }}>
              <MapContainer center={[-22.1062, -50.1740]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Moderno (Ruas)">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
                  </LayersControl.BaseLayer>
                  
                  <LayersControl.BaseLayer name="Satélite (Realista)">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
                  </LayersControl.BaseLayer>

                  <LayersControl.BaseLayer name="Modo Noturno (Foco)">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                  </LayersControl.BaseLayer>
                </LayersControl>

                {filteredCollections.map((item) => (
                  <Marker
                    key={item.id}
                    position={[item.latitude, item.longitude]}
                    icon={createCustomIcon(item.type, item.status)}
                  >
                    <Popup>
                      <div className="w-48 p-1">
                        <Badge className="mb-2" style={{ backgroundColor: getIntensityColor(item.type) }}>{item.type}</Badge>
                        <h4 className="text-sm font-black text-[#1A2B48] leading-tight mb-1">{item.endereco}</h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{item.descricao}</p>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                           <span className="text-[9px] font-bold text-gray-400 uppercase">{item.status}</span>
                           <span className="text-[9px] font-bold text-gray-400">{new Date(item.criado_em).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-white dark:bg-[#1A2B48] rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <PieIcon size={14} /> Distribuição Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {stats.statusDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.statusDistribution.map((s: any) => (
                  <div key={s.status} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] }}></div>
                    <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase truncate">{s.status?.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white dark:bg-[#1A2B48] rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <BarChart3 size={14} /> Bairros Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.neighborhoodData.slice(0, 4).map((n, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] mb-1.5 font-bold">
                      <span className="text-[#1A2B48] dark:text-white">{n.name}</span>
                      <span className="text-[#8be9fd]">{n.value} chamados</span>
                    </div>
                    <div className="w-full bg-gray-50 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-[#8be9fd]`} style={{ width: `${(n.value / (stats.recentCollections.length || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-[#1A2B48] rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-black text-[#1A2B48] dark:text-white">Tendência de Solicitações</CardTitle>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Últimos 7 dias de operação</p>
            </div>
            <div className="bg-[#8be9fd]/10 p-2 rounded-xl">
              <TrendingUp size={18} className="text-[#8be9fd]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyTrend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8be9fd" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8be9fd" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#adb5bd'}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8be9fd" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-[#1A2B48] dark:bg-black rounded-3xl text-white">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white/50">Insights Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                <AlertCircle className="text-red-400" size={20} />
              </div>
              <div>
                <p className="text-xs font-black">Atenção Prioritária</p>
                <p className="text-[11px] text-white/60 leading-relaxed mt-1">
                  O bairro <span className="text-white font-bold">{stats.neighborhoodData[0]?.name || "Principal"}</span> concentra {Math.round((stats.neighborhoodData[0]?.value / (stats.recentCollections.length || 1)) * 100)}% das pendências atuais.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                <TrendingUp className="text-[#8be9fd]" size={20} />
              </div>
              <div>
                <p className="text-xs font-black">Performance de Equipe</p>
                <p className="text-[11px] text-white/60 leading-relaxed mt-1">
                  A taxa de resolução de <span className="text-[#8be9fd] font-bold">{stats.intelligence.resolutionRate}%</span> indica alta eficiência operacional hoje.
                </p>
              </div>
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
    // 1. Carga Inicial
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/ocorrencias/dashboard-stats`);
        if (response.ok) {
          const data = await response.json();
          setTrucks(data.activeTrucks || []);
        }
      } catch (err) {
        console.error("Erro ao carregar frotas:", err);
      }
    };
    fetchData();

    // 2. Escuta Real-time (WebSockets)
    socketService.onMotoristaMovimento((data: any) => {
      setTrucks(prev => prev.map(t => 
        t.motorista_id === data.motorista_id 
          ? { ...t, latitude: data.latitude, longitude: data.longitude } 
          : t
      ));
    });

    socketService.onMotoristaStatus((data: any) => {
      setTrucks(prev => {
        const exists = prev.find(t => t.motorista_id === data.motorista_id);
        
        // Se ficou offline, remover da lista de "Operadores Online"
        if (data.disponibilidade === 'OFFLINE') {
          return prev.filter(t => t.motorista_id !== data.motorista_id);
        }

        // Se já existe, atualizar status
        if (exists) {
          return prev.map(t => 
            t.motorista_id === data.motorista_id 
              ? { ...t, disponibilidade: data.disponibilidade } 
              : t
          );
        }

        // Se é novo e está online, adicionar à lista
        return [...prev, {
          motorista_id: data.motorista_id,
          driver_name: data.motorista_nome,
          disponibilidade: data.disponibilidade,
          latitude: null,
          longitude: null,
          completed: 0
        }];
      });
    });

  }, [API_BASE]);

  const getTruckIcon = (status: string) => {
    const color = status === 'EM_ROTA' ? '#5e8cf7' : '#8be9fd';
    return L.divIcon({
      className: 'custom-truck',
      html: `<div class="custom-truck-container" style="background: ${color}; border: 3px solid white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.4)">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" stroke-width="2.5" fill="none"><path d="M10 17h4V5H2v12h3m1-7h2.5m1 7h-1m1-9h5m-11 9a2 2 0 1 0 4 0 2 2 0 1 0-4 0m11 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-2xl overflow-hidden bg-white dark:bg-[#1A2B48] rounded-3xl">
        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
           <div className="flex items-center gap-3">
             <Truck size={18} className="text-blue-500" />
             <CardTitle className="text-base font-black text-[#1A2B48] dark:text-white">Monitoramento de Frota</CardTitle>
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
                      <p className="text-xs font-black text-[#1A2B48] dark:text-white">{truck.driver_name}</p>
                      <Badge className="text-[8px] bg-[#8be9fd] border-none uppercase">{truck.disponibilidade}</Badge>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-lg bg-white dark:bg-[#1A2B48] rounded-3xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5"><CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Operadores On-line</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {trucks.map(t => (
              <div key={t.motorista_id} className="p-5 flex items-center justify-between">
                <span className="text-sm font-black text-[#1A2B48] dark:text-white">{t.driver_name}</span>
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
// VIEW: CONFIGURAÇÕES (REFATORADA)
// ============================================
export function SettingsView() {
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", papel: "MOTORISTA", truck: "" });
  const [configs, setConfigs] = useState({ 
    preco_gasolina: "5.50", 
    nome_instituicao: "Prefeitura Municipal de Pompéia",
    sla_inatividade_min: "20"
  });
  const [loading, setLoading] = useState(false);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"TODOS" | "ADMIN" | "MOTORISTA">("TODOS");

  const normalizeEmail = (val: string) => {
    return val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9@._-]/g, "");
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-transparent" };
    let score = 0;
    if (pwd.length > 6) score++;
    if (pwd.length > 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: "Fraca", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Média", color: "bg-yellow-500" };
    return { score, label: "Forte", color: "bg-[#2DCE89]" };
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchData = async () => {
    try {
      const headers = { ...getAuthHeaders() };
      const [resUsers, resConfig, resAudit] = await Promise.all([
        fetch(`${API_BASE}/api/auth/usuarios`, { headers }),
        fetch(`${API_BASE}/api/configuracoes/`, { headers }),
        fetch(`${API_BASE}/api/configuracoes/audit`, { headers })
      ]);
      
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.usuarios);
      }
      
      if (resConfig.ok) {
        const data = await resConfig.json();
        setConfigs({
          preco_gasolina: data.preco_gasolina || "5.50",
          nome_instituicao: data.nome_instituicao || "Prefeitura Municipal de Pompéia",
          sla_inatividade_min: data.sla_inatividade_min || "20"
        });
      }

      if (resAudit.ok) {
        const logs = await resAudit.json();
        setAuditLogs(logs);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleUpdateConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/configuracoes/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ 
          preco_gasolina: parseFloat(configs.preco_gasolina), 
          consumo_medio: 3.5,
          nome_instituicao: configs.nome_instituicao,
          sla_inatividade_min: parseInt(configs.sla_inatividade_min)
        })
      });
      if (res.ok) {
        setShowPricePopup(true);
        setTimeout(() => setShowPricePopup(false), 3000);
        fetchData();
      } else {
        toast.error("Erro ao salvar diretrizes");
      }
    } catch (err) {
      toast.error("Erro de conexão ao atualizar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if(!newUser.name || !newUser.email || !newUser.password) return toast.error("Preencha todos os campos!");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ 
          nome: newUser.name, 
          email: newUser.email, 
          senha: newUser.password, 
          papel: newUser.papel, 
          caminhao_id: newUser.truck 
        })
      });
      if (res.ok) {
        setShowUserPopup(true);
        setTimeout(() => setShowUserPopup(false), 3000);
        setNewUser({ name: "", email: "", password: "", papel: "MOTORISTA", truck: "" });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Erro ao cadastrar");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await fetch(`${API_BASE}/api/auth/usuarios/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      fetchData();
      toast.error("Usuário removido");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* POPUP DE CONFIRMAÇÃO: DIRETRIZES */}
      {showPricePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-[#0B1437]/60 backdrop-blur-md" onClick={() => setShowPricePopup(false)}></div>
           <Card className="relative w-full max-w-sm border-none shadow-[0_20px_50px_rgba(139,233,253,0.3)] bg-white dark:bg-[#111C44] rounded-[40px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
              <div className="bg-gradient-to-br from-[#8be9fd] to-[#5e8cf7] p-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
                    <CheckCircle2 size={40} className="text-white" />
                 </div>
                 <h3 className="text-2xl font-black text-[#0B1437] tracking-tight mb-2">Sistema Atualizado!</h3>
                 <p className="text-[#0B1437]/70 font-bold text-sm">As novas diretrizes de governança já estão em vigor em todo o ecossistema.</p>
              </div>
              <CardContent className="p-6">
                 <Button onClick={() => setShowPricePopup(false)} className="w-full h-14 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                    ENTENDIDO
                 </Button>
              </CardContent>
           </Card>
        </div>
      )}

      {/* POPUP DE CONFIRMAÇÃO: USUÁRIO */}
      {showUserPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-[#0B1437]/60 backdrop-blur-md" onClick={() => setShowUserPopup(false)}></div>
           <Card className="relative w-full max-w-sm border-none shadow-[0_20px_50px_rgba(139,233,253,0.3)] bg-white dark:bg-[#111C44] rounded-[40px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
              <div className="bg-gradient-to-br from-[#5e8cf7] to-[#a78bfa] p-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
                    <CheckCircle2 size={40} className="text-white" />
                 </div>
                 <h3 className="text-2xl font-black text-[#0B1437] tracking-tight mb-2">Usuário Criado!</h3>
                 <p className="text-[#0B1437]/70 font-bold text-sm">O novo acesso foi habilitado e já pode ser utilizado em todos os módulos.</p>
              </div>
              <CardContent className="p-6">
                 <Button onClick={() => setShowUserPopup(false)} className="w-full h-14 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                    CONCLUIR
                 </Button>
              </CardContent>
           </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* SEÇÃO: CONFIGURAÇÕES GLOBAIS */}
          <Card className="border-none shadow-2xl bg-white dark:bg-[#111C44] rounded-[40px] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#8be9fd] to-[#5e8cf7] p-8 text-[#0B1437]">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl"><Settings size={24} /></div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Governança Municipal</CardTitle>
                  <p className="text-xs font-bold opacity-70">Parâmetros operacionais e identidade</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nome da Instituição (Branding)</Label>
                <Input 
                  className="h-14 rounded-2xl dark:bg-[#0B1437] border-none font-bold text-lg" 
                  value={configs.nome_instituicao}
                  onChange={e => setConfigs({...configs, nome_instituicao: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-2">Preço Combustível (R$)</Label>
                  <Input 
                    className="h-14 rounded-2xl dark:bg-[#0B1437] border-none font-black text-lg" 
                    type="number"
                    value={configs.preco_gasolina}
                    onChange={e => setConfigs({...configs, preco_gasolina: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-2">SLA Inatividade (Min)</Label>
                  <Input 
                    className="h-14 rounded-2xl dark:bg-[#0B1437] border-none font-black text-lg" 
                    type="number"
                    value={configs.sla_inatividade_min}
                    onChange={e => setConfigs({...configs, sla_inatividade_min: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={handleUpdateConfigs} disabled={loading} className="w-full h-14 bg-[#8be9fd] text-[#0B1437] font-black rounded-2xl hover:scale-[1.02] transition-all">
                {loading ? "PROCESSANDO..." : "SALVAR DIRETRIZES"}
              </Button>
            </CardContent>
          </Card>

          {/* SEÇÃO: GESTÃO DE ACESSOS */}
          <Card className="border-none shadow-2xl bg-white dark:bg-[#111C44] rounded-[40px] overflow-hidden">
             <CardHeader className="p-8 border-b border-gray-50 dark:border-white/5">
                <CardTitle className="text-xl font-black text-[#1A2B48] dark:text-white uppercase tracking-tight">Central de Acessos</CardTitle>
             </CardHeader>
             <CardContent className="p-10">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      className="h-12 rounded-xl dark:bg-[#0B1437] border-none font-bold" 
                      placeholder="Nome" 
                      value={newUser.name} 
                      onChange={e => setNewUser({...newUser, name: e.target.value})} 
                      autoComplete="off"
                    />
                    <Input 
                      className="h-12 rounded-xl dark:bg-[#0B1437] border-none font-bold" 
                      placeholder="Email" 
                      value={newUser.email} 
                      onChange={e => setNewUser({...newUser, email: normalizeEmail(e.target.value)})} 
                      autoComplete="new-user-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input 
                      type="password"
                      className="h-12 rounded-xl dark:bg-[#0B1437] border-none font-bold" 
                      placeholder="Senha Inicial" 
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})} 
                      autoComplete="new-password"
                    />
                    {newUser.password && (
                      <div className="px-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[9px] font-black uppercase text-gray-400">Força da Senha</p>
                          <p className={`text-[9px] font-black uppercase ${getPasswordStrength(newUser.password).color.replace('bg-', 'text-')}`}>
                            {getPasswordStrength(newUser.password).label}
                          </p>
                        </div>
                        <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${getPasswordStrength(newUser.password).color}`}
                            style={{ width: `${(getPasswordStrength(newUser.password).score / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Função</p>
                    <div className="relative group">
                      <select 
                        value={newUser.papel} 
                        onChange={e => setNewUser({...newUser, papel: e.target.value})}
                        className="w-full h-12 px-5 rounded-xl bg-gray-50 dark:bg-[#0B1437] text-sm font-bold border-2 border-transparent focus:border-[#8be9fd]/30 outline-none appearance-none cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-[#111C44]"
                      >
                        <option value="MOTORISTA">MOTORISTA</option>
                        <option value="ADMIN">GERENTE</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#8be9fd] transition-colors">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddUser} disabled={loading} className="w-full h-14 bg-white dark:bg-white/5 border-2 border-[#8be9fd] text-[#8be9fd] font-black rounded-2xl">CRIAR CONTA</Button>
                </div>

                <div className="mt-10 border-t border-gray-100 dark:border-white/5 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contas Ativas</p>
                    <div className="flex gap-2 p-1 bg-gray-50 dark:bg-[#0B1437] rounded-xl">
                      {["TODOS", "ADMIN", "MOTORISTA"].map(f => (
                        <button 
                          key={f} 
                          onClick={() => setRoleFilter(f as any)} 
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${roleFilter === f ? 'bg-[#8be9fd] text-[#0B1437]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                          {f === "ADMIN" ? "GERENTES" : f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-hidden hover:overflow-y-auto space-y-3 pr-1 transition-all scrollbar-hide">
                    {users
                      .filter(u => roleFilter === "TODOS" || u.papel === roleFilter)
                      .map(u => (
                        <div key={u.id} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-[#0B1437] border border-transparent hover:border-[#8be9fd]/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${u.papel === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#8be9fd]/20 text-[#8be9fd]'}`}>{u.papel[0]}</div>
                            <div>
                              <p className="text-sm font-bold">{u.nome}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{u.papel === "ADMIN" ? "GERENTE" : u.papel} • {u.email}</p>
                            </div>
                          </div>
                          <Button variant="ghost" onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></Button>
                        </div>
                      ))}
                  </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* COLUNA LATERAL: AUDITORIA */}
        <div className="space-y-10">
          <Card className="border-none shadow-xl bg-[#0B1437] text-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-[#8be9fd]">Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[700px] overflow-y-auto scrollbar-hide">
               <div className="space-y-6">
                 {auditLogs.map((log, i) => (
                   <div key={i} className="relative pl-6 border-l-2 border-white/10 py-1">
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-[#8be9fd] shadow-[0_0_10px_#8be9fd]"></div>
                      <p className="text-[10px] font-black text-[#8be9fd] uppercase">{log.acao}</p>
                      <p className="text-xs font-medium text-white/80 mt-1">{log.detalhes}</p>
                      <p className="text-[9px] text-white/30 mt-2 font-bold uppercase">{new Date(log.created_at).toLocaleString()}</p>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
