import { useState } from "react";
import { 
  Map, 
  TrendingUp, 
  FileText, 
  Settings, 
  Search,
  AlertCircle,
  CheckCircle2,
  Package,
  Clock,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { HeatmapView, ActiveRoutesView, SettingsView } from "./DashboardViews";

export default function ManagerDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<"heatmap" | "routes" | "reports" | "settings">("heatmap");
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8F9FE]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A2B48] text-white p-6 flex flex-col z-20 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-xl text-white font-bold tracking-tight">ZelaMapa</h1>
          <p className="text-sm text-green-400 font-semibold tracking-wider uppercase mt-1">Portal Gerencial</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveView("heatmap")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeView === "heatmap" 
                ? "bg-[#2DCE89] text-white shadow-lg" 
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <Map className="w-5 h-5" />
            <span>Mapa de Calor</span>
          </button>
          
          <button
            onClick={() => setActiveView("routes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeView === "routes" 
                ? "bg-[#2DCE89] text-white shadow-lg" 
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Rotas Ativas</span>
          </button>
          
          <button
            onClick={() => setActiveView("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeView === "reports" 
                ? "bg-[#2DCE89] text-white shadow-lg" 
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Relatórios</span>
          </button>
          
          <button
            onClick={() => setActiveView("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeView === "settings" 
                ? "bg-[#2DCE89] text-white shadow-lg" 
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </button>
        </nav>

        <div className="mt-8 border-t border-white/10 pt-4">
          <Button onClick={onLogout} variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
             <LogOut className="w-5 h-5 mr-3" />
             Encerrar Sessão
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Usuário</p>
                <p className="text-[#1A2B48] font-semibold">Gestor Municipal</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#2DCE89] flex items-center justify-center text-white font-bold shadow-md">
                GM
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-[#F8F9FE]">
          {/* KPI Cards - Show only on heatmap and routes views */}
          {(activeView === "heatmap" || activeView === "routes") && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-gray-500 font-medium">Coletas Diárias</CardTitle>
                  <Package className="w-5 h-5 text-[#2DCE89]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1A2B48]">346</div>
                  <p className="text-xs text-green-500 font-medium mt-1">+12% vs ontem</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-gray-500 font-medium">Pendentes &gt; 48h</CardTitle>
                  <AlertCircle className="w-5 h-5 text-[#F5365C]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#F5365C]">8</div>
                  <p className="text-xs text-red-500 font-medium mt-1">Requer atenção</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-gray-500 font-medium">Taxa de Eficiência</CardTitle>
                  <CheckCircle2 className="w-5 h-5 text-[#2DCE89]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#2DCE89]">94%</div>
                  <p className="text-xs text-green-500 font-medium mt-1">Meta: 90%</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-gray-500 font-medium">OS Ativas</CardTitle>
                  <Clock className="w-5 h-5 text-[#1A2B48]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1A2B48]">23</div>
                  <p className="text-xs text-[#1A2B48]/60 font-medium mt-1">Em andamento</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Conditional Views */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeView === "heatmap" && <HeatmapView />}
              {activeView === "routes" && <ActiveRoutesView />}
              {activeView === "settings" && (
                <SettingsView
                  notificationsEnabled={notificationsEnabled}
                  setNotificationsEnabled={setNotificationsEnabled}
                  darkModeEnabled={darkModeEnabled}
                  setDarkModeEnabled={setDarkModeEnabled}
                  autoAssignEnabled={autoAssignEnabled}
                  setAutoAssignEnabled={setAutoAssignEnabled}
                />
              )}
              {activeView === "reports" && (
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-[#1A2B48]">Relatórios</CardTitle>
                  </CardHeader>
                  <CardContent className="py-16">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg text-[#1A2B48] mb-2">Relatórios em Desenvolvimento</h3>
                      <p className="text-gray-500">
                        Esta funcionalidade estará disponível em breve.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
