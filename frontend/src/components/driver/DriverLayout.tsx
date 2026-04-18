import { useState, useEffect } from 'react'
import { List, Map, User, LogOut, MapPin, MapPinOff } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuthStore } from '../../stores/authStore'
import { useGeolocation } from '../../hooks/useGeolocation'
import { socketService } from '../../services/socketService'
import { toast } from 'sonner'
import OrdersList from './OrdersList'
import DriverMap from './DriverMap'
import ProfileScreen from './ProfileScreen'

type Tab = 'ordens' | 'mapa' | 'perfil'

export default function DriverLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('ordens')
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null)
  const { user, logout } = useAuthStore()
  
  const { error: geoError, position } = useGeolocation(!!user)

  useEffect(() => {
    if (user?.id) {
      socketService.connectDriver(user.id)
      socketService.onNovaOrdem((data) => {
        toast.success('Nova Ordem Recebida!', {
          description: `OS #${data.ordem?.numero_os || ''} disponível.`,
          action: { label: 'Ver', onClick: () => setActiveTab('ordens') }
        })
      })
    }
    return () => socketService.disconnectDriver()
  }, [user])

  const handleOrderAccepted = (orderId: number) => {
    setActiveOrderId(orderId)
    setActiveTab('mapa') // Direciona para o mapa estilo Waze
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ordens':
        return <OrdersList onOrderAction={handleOrderAccepted} />
      case 'mapa':
        return <DriverMap activeOrderId={activeOrderId} />
      case 'perfil':
        return <ProfileScreen onLogout={logout} />
    }
  }

  return (
    <div className="h-screen bg-[#0f1419] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-[#1a1f2e] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2DCE89] rounded-lg flex items-center justify-center font-bold text-white">ZM</div>
          <div>
            <h1 className="text-white font-bold text-sm leading-none">ZelaMapa</h1>
            <p className="text-[9px] text-[#2DCE89] uppercase font-bold tracking-widest mt-1">Driver App</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {geoError ? (
             <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-[10px] font-bold">
               <MapPinOff className="w-3 h-3" /> GPS OFF
             </div>
          ) : position && (
             <div className="flex items-center gap-1 text-[#2DCE89] bg-[#2DCE89]/10 px-2 py-1 rounded text-[10px] font-bold animate-pulse">
               <MapPin className="w-3 h-3" /> ONLINE
             </div>
          )}
          <Button variant="ghost" size="icon" onClick={logout} className="text-gray-400 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">{renderContent()}</main>

      <nav className="bg-[#1a1f2e] border-t border-gray-800 pb-safe shadow-2xl">
        <div className="flex items-center justify-around h-16">
          <button onClick={() => setActiveTab('ordens')} className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${activeTab === 'ordens' ? 'text-[#2DCE89] scale-110' : 'text-gray-500'}`}>
            <List className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Ordens</span>
          </button>
          <button onClick={() => setActiveTab('mapa')} className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${activeTab === 'mapa' ? 'text-[#2DCE89] scale-110' : 'text-gray-500'}`}>
            <MapIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Mapa</span>
          </button>
          <button onClick={() => setActiveTab('perfil')} className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${activeTab === 'perfil' ? 'text-[#2DCE89] scale-110' : 'text-gray-500'}`}>
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

// Pequeno fix para o ícone de Map não conflitar com o namespace do Leaflet
import { Map as MapIcon } from 'lucide-react'
