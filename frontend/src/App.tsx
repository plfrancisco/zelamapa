import { useState } from 'react';
import LandingPage from './views/LandingPage';
import ManagerDashboard from './views/ManagerDashboard';
import FigmaDriverApp from './views/FigmaDriverApp';
import UserRequestApp from './views/UserRequestApp';

export default function App() {
  const [role, setRole] = useState<'motorista' | 'gerente' | 'cidadao' | null>(null);

  // FLUXO DE DESLOGADO (LANDING PAGE COM MODAL DE LOGIN)
  if (!role) {
    return <LandingPage onLogin={(r) => setRole(r)} />;
  }

  // FLUXO DO CIDADÃO
  if (role === 'cidadao') {
    return <UserRequestApp onLogout={() => setRole(null)} />;
  }

  // FLUXO DO MOTORISTA (APP FULLSCREEN UBER DO FIGMA)
  if (role === 'motorista') {
    return <FigmaDriverApp onLogout={() => setRole(null)} />;
  }

  // FLUXO DO GERENTE (DASHBOARD DO FIGMA)
  return <ManagerDashboard onLogout={() => setRole(null)} />;
}
