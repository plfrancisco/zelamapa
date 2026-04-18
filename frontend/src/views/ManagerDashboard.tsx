import { useState, useEffect } from "react";
import {
  Map,
  TrendingUp,
  FileText,
  Settings,
  Search,
  AlertCircle,
  CheckCircle2,
  Package,
  LogOut,
  Wifi,
  WifiOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { HeatmapView, ActiveRoutesView, SettingsView } from "./DashboardViews";
import { ZelaMapaFullLogo } from "../components/ZelaMapaLogos";
import { useAuthStore } from "../stores/authStore";
import { socketService } from "../services/socketService";
import { toast } from "sonner";

export default function ManagerDashboard() {
  const { user, logout } = useAuthStore();
  const [activeView, setActiveView] = useState<"heatmap" | "routes" | "reports" | "settings">("heatmap");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ocorrencias/dashboard-stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (user?.id) {
      socketService.connectManager(user.id);
      setIsConnected(true);
      socketService.onOrdemAtualizada(() => {
        fetchStats();
        toast.info(`Sistema Atualizado em Tempo Real`);
      });
    }
    return () => {
      socketService.disconnectManager();
      setIsConnected(false);
    };
  }, [user]);

  const dailyCollections = stats?.recentCollections?.length || 0;
  const pendingCount = stats?.recentCollections?.filter((c: any) => c.status === "PENDENTE").length || 0;
  const activeTrucksCount = stats?.activeTrucks?.length || 0;
  const totalCompleted = stats?.activeTrucks?.reduce((acc: number, t: any) => acc + t.completed, 0) || 0;

  return (
    <div className="flex h-screen bg-[#F8F9FE]">
      <aside className="w-68 bg-[#1A2B48] text-white p-6 flex flex-col z-20 shadow-2xl">
        <div className="mb-8">
          <ZelaMapaFullLogo variant="light" className="scale-75 origin-left -ml-2" />
          <p className="text-xs text-[#2DCE89] font-semibold tracking-wider uppercase mt-2">Portal Gerencial</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveView("heatmap")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeView === "heatmap" ? "bg-[#2DCE89] text-white shadow-lg" : "text-white/80 hover:bg-white/10"}`}>
            <Map className="w-5 h-5" /> <span>Mapa de Calor</span>
          </button>
          <button onClick={() => setActiveView("routes")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeView === "routes" ? "bg-[#2DCE89] text-white shadow-lg" : "text-white/80 hover:bg-white/10"}`}>
            <TrendingUp className="w-5 h-5" /> <span>Rotas Ativas</span>
          </button>
          <button onClick={() => setActiveView("reports")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeView === "reports" ? "bg-[#2DCE89] text-white shadow-lg" : "text-white/80 hover:bg-white/10"}`}>
            <FileText className="w-5 h-5" /> <span>Relatórios</span>
          </button>
          <button onClick={() => setActiveView("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeView === "settings" ? "bg-[#2DCE89] text-white shadow-lg" : "text-white/80 hover:bg-white/10"}`}>
            <Settings className="w-5 h-5" /> <span>Configurações</span>
          </button>
        </nav>

        <div className="mt-8 border-t border-white/10 pt-4">
          <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10">
             <LogOut className="w-5 h-5 mr-3" /> Encerrar Sessão
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input placeholder="Buscar por bairro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-50" />
          </div>
          
          <div className="flex items-center gap-6">
            {isConnected ? (
              <div className="flex items-center gap-2 text-[#2DCE89] text-xs font-bold bg-[#2DCE89]/10 px-3 py-1.5 rounded-full">
                <Wifi size={14} className="animate-pulse" /> FEED AO VIVO
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1.5 rounded-full">
                <WifiOff size={14} /> DESCONECTADO
              </div>
            )}
            <div className="text-right">
              <p className="text-sm text-gray-500">Logado como</p>
              <p className="text-[#1A2B48] font-semibold">{user?.nome || 'Gestor'}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-[#F8F9FE]">
          {(activeView === "heatmap" || activeView === "routes") && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-none shadow-sm"><CardHeader className="pb-2 flex-row justify-between"><CardTitle className="text-sm text-gray-500">Ocorrências</CardTitle><Package className="text-[#2DCE89]" /></CardHeader><CardContent><div className="text-3xl font-bold text-[#1A2B48]">{dailyCollections}</div></CardContent></Card>
              <Card className="border-none shadow-sm border-l-4 border-red-500"><CardHeader className="pb-2 flex-row justify-between"><CardTitle className="text-sm text-gray-500">Pendentes</CardTitle><AlertCircle className="text-red-500" /></CardHeader><CardContent><div className="text-3xl font-bold text-red-500">{pendingCount}</div></CardContent></Card>
              <Card className="border-none shadow-sm"><CardHeader className="pb-2 flex-row justify-between"><CardTitle className="text-sm text-gray-500">Frota</CardTitle><TrendingUp className="text-blue-500" /></CardHeader><CardContent><div className="text-3xl font-bold text-blue-500">{activeTrucksCount}</div></CardContent></Card>
              <Card className="border-none shadow-sm border-l-4 border-[#2DCE89]"><CardHeader className="pb-2 flex-row justify-between"><CardTitle className="text-sm text-gray-500">Concluídas</CardTitle><CheckCircle2 className="text-[#2DCE89]" /></CardHeader><CardContent><div className="text-3xl font-bold text-[#2DCE89]">{totalCompleted}</div></CardContent></Card>
            </div>
          )}

          <div className="animate-in fade-in duration-500">
              {activeView === "heatmap" && <HeatmapView />}
              {activeView === "routes" && <ActiveRoutesView />}
              {activeView === "settings" && <SettingsView />}
              {activeView === "reports" && <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest">Em desenvolvimento</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
