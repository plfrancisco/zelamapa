import { useAuthStore } from './stores/authStore';
import LandingPage from './views/LandingPage';
import ManagerDashboard from './views/ManagerDashboard';
import DriverLayout from './components/driver/DriverLayout';
import UserRequestApp from './views/UserRequestApp';

export default function App() {
  const { user, logout } = useAuthStore();

  const handleLogin = (newRole: string) => {
    console.log("Login sequence started for:", newRole);
  };

  // FLUXO DE DESLOGADO
  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // FLUXO DO CIDADÃO / CADASTRADOR
  if (user.papel === 'CADASTRADOR') {
    return <UserRequestApp onLogout={logout} />;
  }

  // FLUXO DO MOTORISTA
  if (user.papel === 'MOTORISTA') {
    return <DriverLayout />;
  }

  // FLUXO DO GERENTE (GESTOR / ADMIN)
  return <ManagerDashboard />;
}
