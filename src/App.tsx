import { useAuthStore } from './stores/authStore';
import { logout as logoutService } from '@/services/authService';
import LandingPage from './pages/LandingPage';
import ManagerDashboard from './pages/ManagerDashboard';
import DriverLayout from './components/driver/DriverLayout';
import UserRequestApp from './pages/UserRequestApp';

export default function App() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await logoutService();
  };

  const handleLogin = (newRole: string) => {
    if (newRole === 'cidadao') {
      useAuthStore.getState().login('mock-token-cidadao', {
        id: 0,
        email: 'cidadao@zelamapa.com',
        nome: 'Cidadão',
        papel: 'CADASTRADOR'
      });
    } else {
      console.log("Login sequence started for:", newRole);
    }
  };

  // FLUXO DE DESLOGADO
  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // FLUXO DO CIDADÃO / CADASTRADOR
  if (user.papel === 'CADASTRADOR') {
    return <UserRequestApp onLogout={handleLogout} />;
  }

  // FLUXO DO MOTORISTA
  if (user.papel === 'MOTORISTA') {
    return <DriverLayout onLogout={handleLogout} />;
  }

  // FLUXO DO GERENTE (GESTOR / ADMIN)
  return <ManagerDashboard onLogout={handleLogout} />;
}
