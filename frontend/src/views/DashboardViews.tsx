import {
  User,
  Bell,
  Shield,
  Database,
  CheckCircle2,
  Clock,
  Navigation as NavigationIcon,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Dados serão carregados da API

// Cores para gráficos
const WASTE_COLORS: Record<string, string> = {
  "Entulho": "#1A2B48",
  "Móveis": "#2DCE89",
  "Poda": "#5e8cf7",
};

const NEIGHBORHOOD_COLORS = ["#1A2B48", "#2DCE89", "#5e8cf7", "#FFC107", "#9C27B0", "#F5365C"];

interface DashboardStats {
  recentCollections: Array<{
    id: number;
    latitude: number;
    longitude: number;
    descricao: string;
    status: string;
    type: string;
  }>;
  activeTrucks: Array<{
    driver_id: number;
    driver_name: string;
    completed: number;
    total: number;
  }>;
  wasteCategories: Array<{ name: string; value: number }>;
  neighborhoodData: Array<{ name: string; value: number }>;
}

export function HeatmapView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/ocorrencias/dashboard-stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2DCE89]" />
        <span className="ml-2 text-gray-500">Carregando dados...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        </CardContent>
      </Card>
    );
  }

  // Process waste categories colors
  const wasteData = stats.wasteCategories.map((item) => ({
    ...item,
    color: WASTE_COLORS[item.name] || "#1A2B48",
  }));

  // Process neighborhood colors
  const neighborhoodData = stats.neighborhoodData.map((item, index) => ({
    ...item,
    color: NEIGHBORHOOD_COLORS[index % NEIGHBORHOOD_COLORS.length],
  }));

  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "outline" | "default"; className: string }> = {
      completed: { label: "Concluído", variant: "default", className: "bg-[#2DCE89] text-white hover:bg-[#25b377]" },
      PENDENTE: { label: "Pendente", variant: "default", className: "bg-[#FFC107] text-white hover:bg-[#e6ae06]" },
      EM_ANDAMENTO: { label: "Em Andamento", variant: "default", className: "bg-blue-500 text-white" },
      CONCLUIDO: { label: "Concluído", variant: "default", className: "bg-[#2DCE89] text-white hover:bg-[#25b377]" },
    };
    return statusMap[status] || { label: status, variant: "outline", className: "border-gray-300" };
  };

  // Calculate approximate hours since creation
  const getHoursAgo = (id: number) => {
    // Simula horas com base no ID (quanto menor o ID, mais antigo)
    // Em produção, usaria timestamp real
    const hoursMap: Record<number, number> = { 1: 48, 2: 24, 3: 12, 4: 6, 5: 3, 6: 1 };
    return hoursMap[id] || Math.floor(Math.random() * 24) + 1;
  };

  // Get address from lat/lng (simplified - just shows coordinates as demo)
  const getAddress = (item: any) => {
    return `Lat: ${item.latitude.toFixed(4)}, Lng: ${item.longitude.toFixed(4)}`;
  };

  // Get neighborhood from ID (mock based on ID)
  const getNeighborhood = (id: number) => {
    const neighborhoods = ["Centro", "Jardim Alvorada", "Vila Nova", "São José", "Pompeia Central"];
    return neighborhoods[id % neighborhoods.length];
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1A2B48]">Mapa de Calor - Pompeia/SP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg overflow-hidden" style={{ height: "500px", zIndex: 0 }}>
              <MapContainer center={[-22.1062, -50.1740]} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Render circles based on occurrence density */}
                {stats.recentCollections.map((item, index) => {
                  const colors = ["red", "orange", "yellow"];
                  const radii = [800, 600, 700];
                  const color = colors[index % colors.length];
                  const radius = radii[index % radii.length];
                  return (
                    <Circle
                      key={item.id}
                      center={[item.latitude, item.longitude]}
                      radius={radius}
                      pathOptions={{ color: 'transparent', fillColor: color, fillOpacity: 0.4 }}
                    />
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2B48]">Categorias de Resíduos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wasteData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {wasteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2B48]">Distribuição por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={neighborhoodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {neighborhoodData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || NEIGHBORHOOD_COLORS[index % NEIGHBORHOOD_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1A2B48]">Coletas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm text-gray-600">OS</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Endereço</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Bairro</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentCollections.map((collection) => {
                  const statusConfig = formatStatus(collection.status);
                  return (
                    <tr key={collection.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-[#1A2B48]">{collection.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{getAddress(collection)}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{getNeighborhood(collection.id)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            collection.type === "Entulho"
                              ? "border-[#1A2B48] text-[#1A2B48]"
                              : collection.type === "Móveis"
                              ? "border-[#2DCE89] text-[#2DCE89]"
                              : "border-[#5e8cf7] text-[#5e8cf7]"
                          }
                        >
                          {collection.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{getHoursAgo(collection.id)}h atrás</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

interface ActiveTruck {
  driver_id: number;
  driver_name: string;
  completed: number;
  total: number;
}

export function ActiveRoutesView() {
  const [trucks, setTrucks] = useState<ActiveTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/ocorrencias/dashboard-stats`);
        if (response.ok) {
          const data = await response.json();
          setTrucks(data.activeTrucks || []);
        }
      } catch (err) {
        console.error("Erro ao buscar caminhões ativos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  // Simula localizações dos motoristas (em produção viria do banco/rastreamento GPS)
  const getTruckLocation = (driverId: number) => {
    const locations: Record<number, [number, number]> = {
      2: [-22.105, -50.175], // João Silva
      3: [-22.095, -50.180], // Maria Santos
      4: [-22.110, -50.170], // Pedro Costa
      5: [-22.115, -50.165], // Ana Lima
    };
    return locations[driverId] || [-22.1062, -50.1740];
  };

  // Status baseado no progresso
  const getTruckStatus = (completed: number, total: number) => {
    if (completed === 0) return "aberta";
    if (completed < total) return "em_rota";
    return "concluida";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2DCE89]" />
        <span className="ml-2 text-gray-500">Carregando rotas...</span>
      </div>
    );
  }

  // Contadores para o painel de status
  const completedRoutes = trucks.reduce((acc, t) => acc + t.completed, 0);
  const totalRoutes = trucks.reduce((acc, t) => acc + t.total, 0);
  const inProgressRoutes = totalRoutes - completedRoutes;
  const pendingRoutes = 1; // Em produção, viria do banco de ocorrências pendentes

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1A2B48]">Rastreamento em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg overflow-hidden" style={{ height: "500px", zIndex: 0 }}>
              <MapContainer center={[-22.1062, -50.1740]} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {trucks.map((truck) => {
                  const status = getTruckStatus(truck.completed, truck.total);
                  const coords = getTruckLocation(truck.driver_id);
                  const icon = L.divIcon({
                    className: 'custom-leaflet-icon',
                    html: `
                      <div class="relative group" style="width: 48px; height: 48px; outline: none;">
                        ${status === 'em_rota' ? '<div class="absolute inset-0 w-12 h-12 rounded-full bg-[#2DCE89] animate-ping opacity-20"></div>' : ''}
                        <div class="relative w-12 h-12 rounded-full bg-[#1A2B48] border-4 border-white flex items-center justify-center shadow-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-4m-1 7h-2.5"/><path d="M14 17h-1"/><path d="M14 8h5"/><path d="M4 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
                        </div>
                      </div>
                    `,
                    iconSize: [48, 48],
                    iconAnchor: [24, 24],
                  });

                  return (
                    <Marker key={truck.driver_id} position={coords} icon={icon}>
                      <Popup>
                        <div className="p-1">
                          <p className="text-xs text-gray-500 font-medium">CAM-0{truck.driver_id % 10}</p>
                          <p className="text-sm font-bold text-[#1A2B48] mb-1">{truck.driver_name}</p>
                          <p className="text-xs text-gray-600">
                            {truck.completed}/{truck.total} coletas
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {status === 'em_rota' ? '🟢 Em rota' : status === 'concluida' ? '✅ Concluído' : '⚪ Aguardando'}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2B48]">Motoristas Ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trucks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Nenhuma rota ativa no momento</p>
              ) : (
                trucks.map((truck) => {
                  const status = getTruckStatus(truck.completed, truck.total);
                  return (
                    <div
                      key={truck.driver_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          status === "em_rota" ? "bg-[#2DCE89] animate-pulse" :
                          status === "concluida" ? "bg-gray-400" :
                          "bg-gray-400"
                        }`}></div>
                        <div>
                          <p className="text-sm text-[#1A2B48]">{truck.driver_name}</p>
                          <p className="text-xs text-gray-500">CAM-0{truck.driver_id % 10}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{truck.completed}/{truck.total}</p>
                        <p className="text-xs text-gray-400">Agora</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2B48]">Status das Rotas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DCE89]" />
                  <span className="text-sm text-gray-700">Concluídas</span>
                </div>
                <span className="text-sm text-[#1A2B48]">{completedRoutes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NavigationIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Em Rota</span>
                </div>
                <span className="text-sm text-[#1A2B48]">{inProgressRoutes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFC107]" />
                  <span className="text-sm text-gray-700">Pendentes</span>
                </div>
                <span className="text-sm text-[#1A2B48]">{pendingRoutes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

interface Driver {
  id: number;
  name: string;
  email: string;
  papel: string;
  truck?: string;
  status: string;
  criado_em?: string;
}

export function SettingsView({
  notificationsEnabled,
  setNotificationsEnabled,
  darkModeEnabled,
  setDarkModeEnabled,
  autoAssignEnabled,
  setAutoAssignEnabled
}: {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  darkModeEnabled: boolean;
  setDarkModeEnabled: (value: boolean) => void;
  autoAssignEnabled: boolean;
  setAutoAssignEnabled: (value: boolean) => void;
}) {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    papel: "MOTORISTA" as "MOTORISTA" | "ADMIN",
    truck: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Carregar motoristas na montagem do componente
  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/usuarios?papel=MOTORISTA`);
      if (response.ok) {
        const data = await response.json();
        const formattedDrivers = data.usuarios.map((u: any) => ({
          id: u.id,
          name: u.nome,
          email: u.email,
          papel: u.papel,
          truck: "", // Não temos o caminhão no backend
          status: "ativo",
          criado_em: u.criado_em,
        }));
        setDrivers(formattedDrivers);
      }
    } catch (err) {
      console.error("Erro ao buscar motoristas:", err);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setRegistrationMessage({ type: "error", text: "Preencha todos os campos obrigatórios" });
      return;
    }

    setIsSubmitting(true);
    setRegistrationMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: newUser.name,
          email: newUser.email,
          senha: newUser.password,
          papel: newUser.papel,
          caminhao_id: newUser.truck || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setRegistrationMessage({ type: "success", text: `Usuário cadastrado com sucesso como ${newUser.papel === "MOTORISTA" ? "Motorista" : "Gestor"}!` });
        setNewUser({ name: "", email: "", password: "", papel: "MOTORISTA", truck: "", phone: "" });
        setShowPassword(false);

        // Recarregar lista de motoristas se for MOTORISTA
        if (newUser.papel === "MOTORISTA") {
          await fetchDrivers();
        }
      } else {
        setRegistrationMessage({ type: "error", text: result.detail || "Erro ao cadastrar usuário" });
      }
    } catch (err: any) {
      setRegistrationMessage({ type: "error", text: "Erro de conexão com o servidor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/usuarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Atualizar lista local
        setDrivers(drivers.filter((driver) => driver.id !== id));
      } else {
        const data = await response.json();
        alert(data.detail || "Erro ao remover usuário");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="space-y-6">
      {/* First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#2DCE89]" />
              <CardTitle className="text-[#1A2B48]">Informações do Perfil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" defaultValue="Gestor Municipal" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="gestor@pompeia.sp.gov.br" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" defaultValue="(14) 3452-1234" className="mt-2" />
            </div>
            <Button className="w-full bg-[#2DCE89] hover:bg-[#25b377] text-white">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#2DCE89]" />
              <CardTitle className="text-[#1A2B48]">Notificações</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notificações Push</Label>
                <p className="text-sm text-gray-500">Receber alertas em tempo real</p>
              </div>
              <Switch 
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-gray-500">Resumos diários e semanais</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                <p className="text-sm text-gray-500">Alertas críticos apenas</p>
              </div>
              <Switch id="sms-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#2DCE89]" />
              <CardTitle className="text-[#1A2B48]">Segurança</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Alterar Senha</Label>
              <Button variant="outline" className="w-full mt-2">
                Atualizar Senha
              </Button>
            </div>
            <div>
              <Label>Autenticação de Dois Fatores</Label>
              <p className="text-sm text-gray-500 mb-2">Adicione uma camada extra de segurança</p>
              <Button variant="outline" className="w-full">
                Configurar 2FA
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#2DCE89]" />
              <CardTitle className="text-[#1A2B48]">Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-gray-500">Tema dark para a interface</p>
              </div>
              <Switch 
                id="dark-mode"
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-assign">Atribuição Automática</Label>
                <p className="text-sm text-gray-500">Distribuir OS automaticamente</p>
              </div>
              <Switch 
                id="auto-assign"
                checked={autoAssignEnabled}
                onCheckedChange={setAutoAssignEnabled}
              />
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Label>Versão do Sistema</Label>
              <p className="text-sm text-gray-500 mt-1">v2.4.1 - Atualizado em 01/04/2026</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section - Full Width */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-[#2DCE89]" />
              <CardTitle className="text-[#1A2B48]">Gerenciar Contas</CardTitle>
            </div>
            <Badge className="bg-[#2DCE89] text-white hover:bg-[#25b377]">
              {drivers.length} Usuários
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New User Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm text-[#1A2B48] mb-4">Cadastrar Nova Conta</h4>

            {/* Account Type Selector */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setNewUser({ ...newUser, papel: "MOTORISTA" })}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors cursor-pointer ${
                  newUser.papel === "MOTORISTA"
                    ? "border-[#2DCE89] bg-[#2DCE89]/10 text-[#1A2B48]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Motorista
              </button>
              <button
                type="button"
                onClick={() => setNewUser({ ...newUser, papel: "ADMIN" })}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors cursor-pointer ${
                  newUser.papel === "ADMIN"
                    ? "border-[#2DCE89] bg-[#2DCE89]/10 text-[#1A2B48]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Gestor / Admin
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="user-name" className="text-xs">Nome Completo *</Label>
                <Input
                  id="user-name"
                  placeholder="Ex: Carlos Silva"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="user-email" className="text-xs">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder={newUser.papel === "MOTORISTA" ? "motorista@pompeia.sp.gov.br" : "gestor@pompeia.sp.gov.br"}
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="user-password" className="text-xs">Senha * (mín. 6 caracteres)</Label>
                <div className="relative mt-1">
                  <Input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="user-phone" className="text-xs">Telefone</Label>
                <Input
                  id="user-phone"
                  placeholder="(14) 99999-9999"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              {newUser.papel === "MOTORISTA" && (
                <div>
                  <Label htmlFor="user-truck" className="text-xs">ID do Caminhão</Label>
                  <Input
                    id="user-truck"
                    placeholder="Ex: CAM-05"
                    value={newUser.truck}
                    onChange={(e) => setNewUser({ ...newUser, truck: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
              <div className="flex items-end">
                <Button
                  onClick={handleAddUser}
                  disabled={isSubmitting}
                  className="w-full bg-[#2DCE89] hover:bg-[#25b377] text-white"
                >
                  {isSubmitting ? "Cadastrando..." : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastrar {newUser.papel === "MOTORISTA" ? "Motorista" : "Gestor"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Feedback Message */}
            {registrationMessage && (
              <div
                className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  registrationMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {registrationMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{registrationMessage.text}</span>
              </div>
            )}
          </div>

          {/* Users List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm text-gray-600">
                {newUser.papel === "MOTORISTA" ? "Motoristas Cadastrados" : "Gestores Cadastrados"}
              </h4>
              <button
                onClick={() => {
                  if (newUser.papel === "MOTORISTA") {
                    fetchDrivers().catch(() => {});
                  }
                }}
                className="text-sm text-[#2DCE89] hover:text-[#25b377] cursor-pointer"
              >
                Atualizar lista
              </button>
            </div>
            {drivers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum usuário cadastrado ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#2DCE89] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#2DCE89] flex items-center justify-center text-white font-bold">
                        {driver.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm text-[#1A2B48]">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            driver.papel === "ADMIN"
                              ? "border-[#1A2B48] text-[#1A2B48]"
                              : "border-[#2DCE89] text-[#2DCE89]"
                          }
                        >
                          {driver.papel === "ADMIN" ? "Gestor" : "Motorista"}
                        </Badge>
                        {driver.truck && (
                          <>
                            <p className="text-xs text-gray-500 mt-1">{driver.truck}</p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{driver.status}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDriver(driver.id)}
                        className="text-[#F5365C] hover:text-[#F5365C] hover:bg-[#F5365C]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}