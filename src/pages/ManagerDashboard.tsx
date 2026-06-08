import { useState, useEffect } from "react";
import {
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  Package,
  LogOut,
  Wifi,
  WifiOff,
  Truck,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { HeatmapView, ActiveRoutesView, SettingsView, ReportsBIView } from "./DashboardViews";
import { ZelaMapaFullLogo } from "../components/ZelaMapaLogos";
import { useAuthStore } from "../stores/authStore";
import { socketService } from "../api/socketService";
import { toast } from "sonner";

interface ManagerDashboardProps {
  onLogout: () => void;
}

export default function ManagerDashboard({ onLogout }: ManagerDashboardProps) {
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState<"heatmap" | "routes" | "reports" | "settings">("heatmap");
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
        toast.info(`Painel Atualizado em Tempo Real`);
      });

      socketService.onMotoristaStatus(() => {
        fetchStats();
      });
    }
    return () => {
      socketService.disconnectManager();
      setIsConnected(false);
    };
  }, [user]);

  const dailyCollections = stats?.totalCount || 0;
  const pendingCount = stats?.pendingCount || 0;
  const activeTrucksCount = stats?.activeTrucks?.length || 0;
  const totalCompleted = stats?.activeTrucks?.reduce((acc: number, t: any) => acc + t.completed, 0) || 0;

  return (
    <div className="flex h-screen bg-[#F4F7FE] dark:bg-[#0B1437] transition-colors duration-500 overflow-hidden font-sans">
      {/* SIDEBAR ESTILO ERP PREMIUM */}
      <aside className="w-72 bg-white dark:bg-[#111C44] border-r border-gray-200 dark:border-white/5 flex flex-col shadow-xl z-20 transition-all">
        <div className="p-8">
          <div className="mb-10">
            <ZelaMapaFullLogo variant={document.documentElement.classList.contains('dark') ? "light" : "dark"} className="scale-90 origin-left" />
            <p className="text-[10px] font-black text-[#8be9fd] uppercase tracking-[0.2em] mt-3 ml-1 opacity-80">GovTech Excellence</p>
          </div>
          
          <nav className="space-y-3">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Mapa de Calor" 
              active={activeView === "heatmap"} 
              onClick={() => setActiveView("heatmap")} 
            />
            <SidebarItem 
              icon={<Truck size={20} />} 
              label="Rotas Ativas" 
              active={activeView === "routes"} 
              onClick={() => setActiveView("routes")} 
            />
            <SidebarItem 
              icon={<FileText size={20} />} 
              label="Relatórios BI" 
              active={activeView === "reports"} 
              onClick={() => setActiveView("reports")} 
            />
            <SidebarItem 
              icon={<Settings size={20} />} 
              label="Configurações" 
              active={activeView === "settings"} 
              onClick={() => setActiveView("settings")} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 dark:border-white/5">
          <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-5 transition-all hover:shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#8be9fd] to-[#5e8cf7] rounded-2xl flex items-center justify-center text-[#0B1437] font-black text-sm shadow-lg shadow-[#8be9fd]/20">
                {user?.nome?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#1A2B48] dark:text-white truncate">{user?.nome}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user?.papel}</p>
              </div>
            </div>
            <button 
              onClick={() => { onLogout(); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
            >
              <LogOut size={14} /> ENCERRAR SESSÃO
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TOP BAR REFINADA */}
        <header className="h-24 bg-white/70 dark:bg-[#111C44]/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-10 z-10 transition-all">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-1">Página Principal</p>
              <h2 className="text-xl font-black text-[#1A2B48] dark:text-white tracking-tight">
                {activeView === "heatmap" ? "Inteligência Geográfica" : 
                 activeView === "routes" ? "Monitoramento de Frota" : 
                 activeView === "reports" ? "Análise de Dados BI" : "Preferências do Sistema"}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {isConnected ? (
              <div className="flex items-center gap-2 text-[#8be9fd] text-[10px] font-black bg-[#8be9fd]/10 px-4 py-2 rounded-full border border-[#8be9fd]/20 shadow-sm shadow-[#8be9fd]/10">
                <Wifi size={14} className="animate-pulse" /> FEED AO VIVO
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                <WifiOff size={14} /> OFFLINE
              </div>
            )}
          </div>
        </header>

        {/* CONTENT SECTION SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto space-y-10">
            {/* KPI ROW ESTILO ERP MODERNO */}
            {(activeView === "heatmap" || activeView === "routes") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Ocorrências" value={dailyCollections} icon={<Package />} color="blue" />
                <KPICard title="Alertas Pendentes" value={pendingCount} icon={<AlertCircle />} color="red" />
                <KPICard title="Frota Operacional" value={activeTrucksCount} icon={<Truck />} color="purple" />
                <KPICard title="Serviços Concluídos" value={totalCompleted} icon={<CheckCircle2 />} color="green" />
              </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {activeView === "heatmap" && <HeatmapView />}
                {activeView === "routes" && <ActiveRoutesView />}
                {activeView === "settings" && <SettingsView />}
                {activeView === "reports" && <ReportsBIView />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-300 group ${
        active 
          ? "bg-white dark:bg-[#1B254B] text-[#8be9fd] shadow-xl shadow-black/5 dark:shadow-black/20 translate-x-1" 
          : "text-gray-400 dark:text-white/30 hover:bg-white/50 dark:hover:bg-white/5 hover:text-[#1A2B48] dark:hover:text-white hover:translate-x-1"
      }`}
    >
      <div className={`p-2 rounded-xl transition-all duration-300 ${active ? "bg-[#8be9fd] text-[#0B1437] shadow-lg shadow-[#8be9fd]/30" : "bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:bg-[#8be9fd]/10 group-hover:text-[#8be9fd]"}`}>
        {icon}
      </div>
      <span className="text-sm font-black tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1.5 h-6 bg-[#8be9fd] rounded-full"></div>}
    </button>
  );
}

function KPICard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10",
    red: "text-red-500 bg-red-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    green: "text-[#8be9fd] bg-[#8be9fd]/10"
  };

  return (
    <Card className="border-none shadow-xl bg-white dark:bg-[#111C44] rounded-[32px] overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl">
      <CardContent className="p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-black text-[#1A2B48] dark:text-white tracking-tighter">{value}</h3>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
