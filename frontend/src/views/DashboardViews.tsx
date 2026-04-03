import {
  Map,
  Truck,
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
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useState } from "react";
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

const wasteCategories = [
  { name: "Entulho", value: 145, color: "#1A2B48" },
  { name: "Móveis", value: 89, color: "#2DCE89" },
  { name: "Poda", value: 112, color: "#5e8cf7" },
];

const neighborhoodData = [
  { name: "Centro", value: 34 },
  { name: "Jardim Alvorada", value: 28 },
  { name: "Vila Nova", value: 22 },
  { name: "São José", value: 19 },
  { name: "Outros", value: 43 },
];

const activeTrucks = [
  {
    id: "CAM-01",
    driver: "João Silva",
    location: { lat: 35, lng: 40 },
    status: "em_rota",
    collectionsCompleted: 3,
    collectionsTotal: 5,
    lastUpdate: "2 min atrás",
  },
  {
    id: "CAM-02",
    driver: "Maria Santos",
    location: { lat: 60, lng: 70 },
    status: "coletando",
    collectionsCompleted: 5,
    collectionsTotal: 6,
    lastUpdate: "Agora",
  },
  {
    id: "CAM-03",
    driver: "Pedro Costa",
    location: { lat: 50, lng: 30 },
    status: "em_rota",
    collectionsCompleted: 2,
    collectionsTotal: 7,
    lastUpdate: "5 min atrás",
  },
  {
    id: "CAM-04",
    driver: "Ana Lima",
    location: { lat: 75, lng: 55 },
    status: "retornando",
    collectionsCompleted: 8,
    collectionsTotal: 8,
    lastUpdate: "1 min atrás",
  },
];

const recentCollections = [
  {
    id: "OS-2845",
    address: "Rua das Flores, 123",
    neighborhood: "Centro",
    type: "Entulho",
    status: "completed",
    hours: 2,
  },
  {
    id: "OS-2846",
    address: "Av. Brasil, 456",
    neighborhood: "Jardim Alvorada",
    type: "Móveis",
    status: "pending",
    hours: 36,
  },
  {
    id: "OS-2847",
    address: "Rua São Paulo, 789",
    neighborhood: "Vila Nova",
    type: "Poda",
    status: "alert",
    hours: 52,
  },
  {
    id: "OS-2848",
    address: "Rua Minas Gerais, 321",
    neighborhood: "São José",
    type: "Entulho",
    status: "completed",
    hours: 12,
  },
];

export function HeatmapView() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1A2B48]">Mapa de Calor - Pompeia/SP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden" style={{ height: "500px" }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-[#1A2B48] mx-auto mb-4 opacity-20" />
                  <p className="text-[#1A2B48] opacity-60">Mapa interativo de Pompeia</p>
                  <p className="text-sm text-gray-500 mt-2">Áreas de maior concentração em vermelho</p>
                </div>
              </div>
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/30 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-orange-500/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-yellow-500/20 rounded-full blur-2xl"></div>
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
                <BarChart data={wasteCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {wasteCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2B48]">Distribuição por Bairro</CardTitle>
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
                    {neighborhoodData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={["#1A2B48", "#2DCE89", "#5e8cf7", "#FFC107", "#9C27B0"][index % 5]} 
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
                {recentCollections.map((collection) => (
                  <tr key={collection.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-[#1A2B48]">{collection.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{collection.address}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{collection.neighborhood}</td>
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
                      {collection.status === "completed" && (
                        <Badge className="bg-[#2DCE89] text-white hover:bg-[#25b377]">
                          Concluído
                        </Badge>
                      )}
                      {collection.status === "pending" && (
                        <Badge className="bg-[#FFC107] text-white hover:bg-[#e6ae06]">
                          Pendente
                        </Badge>
                      )}
                      {collection.status === "alert" && (
                        <Badge className="bg-[#F5365C] text-white hover:bg-[#dc2f50]">
                          Alerta
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{collection.hours}h atrás</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function ActiveRoutesView() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#1A2B48]">Rastreamento em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden" style={{ height: "500px" }}>
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `
                  linear-gradient(rgba(26, 43, 72, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(26, 43, 72, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}></div>

              {activeTrucks.map((truck) => (
                <div
                  key={truck.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${truck.location.lng}%`,
                    top: `${truck.location.lat}%`,
                  }}
                >
                  <div className="relative group">
                    <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#2DCE89] animate-ping opacity-20"></div>
                    <div className="relative w-12 h-12 rounded-full bg-[#1A2B48] border-4 border-white flex items-center justify-center shadow-xl">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 whitespace-nowrap">
                        <p className="text-xs text-gray-500">{truck.id}</p>
                        <p className="text-sm text-[#1A2B48]">{truck.driver}</p>
                        <p className="text-xs text-gray-600 mt-1">{truck.collectionsCompleted}/{truck.collectionsTotal} coletas</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2B48]">Caminhões Ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeTrucks.map((truck) => (
                <div key={truck.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      truck.status === "coletando" ? "bg-[#2DCE89] animate-pulse" :
                      truck.status === "em_rota" ? "bg-blue-500" :
                      "bg-gray-400"
                    }`}></div>
                    <div>
                      <p className="text-sm text-[#1A2B48]">{truck.id}</p>
                      <p className="text-xs text-gray-500">{truck.driver}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{truck.collectionsCompleted}/{truck.collectionsTotal}</p>
                    <p className="text-xs text-gray-400">{truck.lastUpdate}</p>
                  </div>
                </div>
              ))}
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
                <span className="text-sm text-[#1A2B48]">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NavigationIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Em Rota</span>
                </div>
                <span className="text-sm text-[#1A2B48]">4</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFC107]" />
                  <span className="text-sm text-gray-700">Pendentes</span>
                </div>
                <span className="text-sm text-[#1A2B48]">1</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
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
  const [drivers, setDrivers] = useState([
    { id: 1, name: "João Silva", email: "joao.silva@pompeia.sp.gov.br", truck: "CAM-01", status: "ativo" },
    { id: 2, name: "Maria Santos", email: "maria.santos@pompeia.sp.gov.br", truck: "CAM-02", status: "ativo" },
    { id: 3, name: "Pedro Costa", email: "pedro.costa@pompeia.sp.gov.br", truck: "CAM-03", status: "ativo" },
    { id: 4, name: "Ana Lima", email: "ana.lima@pompeia.sp.gov.br", truck: "CAM-04", status: "ativo" },
  ]);

  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    password: "",
    truck: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleAddDriver = () => {
    if (newDriver.name && newDriver.email && newDriver.password && newDriver.truck) {
      setDrivers([
        ...drivers,
        {
          id: drivers.length + 1,
          name: newDriver.name,
          email: newDriver.email,
          truck: newDriver.truck,
          status: "ativo",
        },
      ]);
      setNewDriver({ name: "", email: "", password: "", truck: "", phone: "" });
      setShowPassword(false);
    }
  };

  const handleDeleteDriver = (id: number) => {
    setDrivers(drivers.filter((driver) => driver.id !== id));
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

      {/* Driver Management Section - Full Width */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-[#2DCE89]" />
              <CardTitle className="text-[#1A2B48]">Gerenciar Motoristas</CardTitle>
            </div>
            <Badge className="bg-[#2DCE89] text-white hover:bg-[#25b377]">
              {drivers.length} Ativos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Driver Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm text-[#1A2B48] mb-4">Cadastrar Novo Motorista</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="driver-name" className="text-xs">Nome Completo</Label>
                <Input
                  id="driver-name"
                  placeholder="Ex: Carlos Silva"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="driver-email" className="text-xs">Email / Login</Label>
                <Input
                  id="driver-email"
                  type="email"
                  placeholder="motorista@pompeia.sp.gov.br"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="driver-password" className="text-xs">Senha</Label>
                <div className="relative mt-1">
                  <Input
                    id="driver-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newDriver.password}
                    onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
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
                <Label htmlFor="driver-phone" className="text-xs">Telefone</Label>
                <Input
                  id="driver-phone"
                  placeholder="(14) 99999-9999"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="driver-truck" className="text-xs">ID do Caminhão</Label>
                <Input
                  id="driver-truck"
                  placeholder="Ex: CAM-05"
                  value={newDriver.truck}
                  onChange={(e) => setNewDriver({ ...newDriver, truck: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddDriver}
                  className="w-full bg-[#2DCE89] hover:bg-[#25b377] text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Motorista
                </Button>
              </div>
            </div>
          </div>

          {/* Drivers List */}
          <div>
            <h4 className="text-sm text-gray-600 mb-3">Motoristas Cadastrados</h4>
            <div className="space-y-3">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#2DCE89] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#2DCE89] flex items-center justify-center text-white">
                      {driver.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm text-[#1A2B48]">{driver.name}</p>
                      <p className="text-xs text-gray-500">{driver.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="outline" className="border-[#2DCE89] text-[#2DCE89]">
                        {driver.truck}
                      </Badge>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}