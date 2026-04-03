import { useState } from 'react';
import { LucideLayoutDashboard, LucideMap, LucideTruck, LucideSettings, LucideFileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('mapa_calor');

  const renderView = () => {
    switch (activeTab) {
      case 'mapa_calor': return <MapaCalorView />;
      case 'motorista': return <AppMotorista />;
      case 'rotas_ativas': return <RotasAtivas />;
      case 'relatorio': return <Relatorio />;
      case 'configuracoes': return <Configuracoes />;
      default: return <MapaCalorView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar / Bottom Nav (Mobile) */}
      <nav className="bg-azul-marinho text-white w-full md:w-64 flex flex-row md:flex-col p-4 py-3 shrink-0 fixed bottom-0 md:relative z-10 overflow-x-auto gap-4">
        <h1 className="text-xl font-bold mb-8 hidden md:block">ZelaMapa</h1>
        
        <button 
          onClick={() => setActiveTab('mapa_calor')}
          className={`flex items-center gap-2 p-2 rounded transition-colors whitespace-nowrap ${activeTab === 'mapa_calor' ? 'bg-verde-esmeralda/80' : 'hover:bg-azul-marinho/80'}`}
        >
          <LucideMap size={20} /> Mapa de Calor
        </button>
        <button 
          onClick={() => setActiveTab('rotas_ativas')}
          className={`flex items-center gap-2 p-2 rounded transition-colors whitespace-nowrap ${activeTab === 'rotas_ativas' ? 'bg-verde-esmeralda/80' : 'hover:bg-azul-marinho/80'}`}
        >
          <LucideLayoutDashboard size={20} /> Rotas Ativas
        </button>
        <button 
          onClick={() => setActiveTab('motorista')}
          className={`flex items-center gap-2 p-2 rounded transition-colors whitespace-nowrap ${activeTab === 'motorista' ? 'bg-verde-esmeralda/80' : 'hover:bg-azul-marinho/80'}`}
        >
          <LucideTruck size={20} /> App Motorista
        </button>
        <button 
          onClick={() => setActiveTab('relatorio')}
          className={`flex items-center gap-2 p-2 rounded transition-colors whitespace-nowrap ${activeTab === 'relatorio' ? 'bg-verde-esmeralda/80' : 'hover:bg-azul-marinho/80'}`}
        >
          <LucideFileText size={20} /> Relatórios
        </button>
        <button 
          onClick={() => setActiveTab('configuracoes')}
          className={`flex items-center gap-2 p-2 rounded transition-colors whitespace-nowrap ${activeTab === 'configuracoes' ? 'bg-verde-esmeralda/80' : 'hover:bg-azul-marinho/80'}`}
        >
          <LucideSettings size={20} /> Configurações
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto w-full">
        <header className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-azul-marinho capitalize">
                {activeTab.replace('_', ' ')}
            </h2>
            <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-verde-esmeralda"></span>
                <span className="w-3 h-3 rounded-full bg-vermelho-alerta"></span>
            </div>
        </header>

        <div className="bg-white rounded-xl shadow p-6 min-h-[60vh]">
            {renderView()}
        </div>
      </main>
    </div>
  );
}

// Stubs para Views
function MapaCalorView() {
  return <div>Visualização Densidade de Resíduos...</div>;
}
function AppMotorista() {
  return <div>Operação e Coleta de Resíduos (Motorista)...</div>;
}
function RotasAtivas() {
  return <div>Lista de Caminhões Rastreamento em Tempo Real...</div>;
}
function Relatorio() {
  return <div>Gestão Analítica e Estatísticas...</div>;
}
function Configuracoes() {
  return <div>Controle de Notificações, SLA e Setup...</div>;
}
