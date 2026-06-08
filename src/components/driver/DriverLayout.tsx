import { useState, useEffect } from 'react'
import { List, User, LogOut, MapPin, MapPinOff, Map as MapIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuthStore } from '../../stores/authStore'
import { useGeolocation } from '../../hooks/useGeolocation'
import { socketService } from '../../api/socketService'
import { toast } from 'sonner'
import OrdersList from './OrdersList'
import DriverMap from './DriverMap'
import ProfileScreen from './ProfileScreen'
import { ZelaMapaFullLogo } from '../ZelaMapaLogos'

type Tab = 'ordens' | 'mapa' | 'perfil'

interface DriverLayoutProps {
  onLogout: () => void;
}

export default function DriverLayout({ onLogout }: DriverLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('ordens')
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null)
  const { user } = useAuthStore()
  
  const { error: geoError, position } = useGeolocation(!!user)

  useEffect(() => {
    if (user?.id) {
      socketService.connectDriver(user.id)
      socketService.onNovaOrdem((data: any) => {
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
    setActiveTab('mapa')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ordens':
        return <OrdersList onOrderAction={handleOrderAccepted} />
      case 'mapa':
        return <DriverMap activeOrderId={activeOrderId} />
      case 'perfil':
        return <ProfileScreen onLogout={onLogout} />
    }
  }

  return (
    <div className="h-screen bg-[#F4F7FE] flex flex-col font-sans overflow-hidden">
      {/* HEADER PREMIUM (DNA DASHBOARD) */}
      <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div className="flex flex-col">
          <ZelaMapaFullLogo variant="dark" className="h-10 scale-90 origin-left" />
          <p className="text-[10px] font-black text-[#5e8cf7] uppercase tracking-[0.2em] ml-1 opacity-80">GovTech Excellence</p>
        </div>

        <div className="flex items-center gap-3">
          {geoError ? (
             <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full text-[10px] font-black border border-red-500/20">
               <MapPinOff className="w-3.5 h-3.5" /> GPS OFF
             </div>
          ) : position && (
             <div className="flex items-center gap-1 text-[#2DCE89] bg-[#2DCE89]/10 px-3 py-1.5 rounded-full text-[10px] font-black border border-[#2DCE89]/20 animate-pulse">
               <MapPin className="w-3.5 h-3.5" /> ONLINE
             </div>
          )}
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-md mx-auto h-full">
          {renderContent()}
        </div>
      </main>

      {/* NAVEGAÇÃO EM PÍLULA FLUTUANTE (PREMIUM) */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
        <nav className="max-w-xs mx-auto bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full p-2 flex items-center justify-around">
          <NavButton 
            active={activeTab === 'ordens'} 
            onClick={() => setActiveTab('ordens')} 
            icon={<List className="w-6 h-6" />} 
            label="Ordens" 
          />
          <NavButton 
            active={activeTab === 'mapa'} 
            onClick={() => setActiveTab('mapa')} 
            icon={<MapIcon className="w-6 h-6" />} 
            label="Mapa" 
          />
          <NavButton 
            active={activeTab === 'perfil'} 
            onClick={() => setActiveTab('perfil')} 
            icon={<User className="w-6 h-6" />} 
            label="Perfil" 
          />
        </nav>
      </div>
    </div>
  )
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 px-5 py-2 rounded-full transition-all duration-300 ${
        active 
          ? 'bg-[#2DCE89] text-white shadow-lg shadow-[#2DCE89]/30 scale-105' 
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0'}`}>
        {label}
      </span>
    </button>
  )
}
