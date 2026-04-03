import { useState } from 'react';
import LoginView from './views/LoginView';
import ManagerDashboard from './views/ManagerDashboard';
import FigmaDriverApp from './views/FigmaDriverApp';

export default function App() {
  const [role, setRole] = useState<'motorista' | 'gerente' | null>(null);

  // FLUXO DE DESLOGADO (LOGIN)
  if (!role) {
    return <LoginView onLogin={(r) => setRole(r)} />;
  }

  // FLUXO DO MOTORISTA (APP FULLSCREEN UBER DO FIGMA)
  if (role === 'motorista') {
    return <FigmaDriverApp onLogout={() => setRole(null)} />;
  }

  // FLUXO DO GERENTE (DASHBOARD DO FIGMA)
  return <ManagerDashboard onLogout={() => setRole(null)} />;
}
