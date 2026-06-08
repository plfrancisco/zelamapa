import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, LocateFixed, AlertCircle } from 'lucide-react'
import { orderService } from '../../services/orderService'

// Corrigir ícones do Leaflet que somem com o build do Vite
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

interface DriverMapProps {
  activeOrderId?: number | null
}

// Componente para centralizar o mapa automaticamente
function MapResizer({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 15)
  }, [center, map])
  return null
}

export default function DriverMap({ activeOrderId }: DriverMapProps) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<[number, number][]>([])
  const [destination, setDestination] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Obter posição do motorista (simulado ou real)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([-22.1062, -50.1740]) // Fallback Pompeia
    )
  }, [])

  // 2. Buscar rota se houver uma ordem ativa
  useEffect(() => {
    if (activeOrderId) {
      fetchRoute(activeOrderId)
    }
  }, [activeOrderId])

  const fetchRoute = async (orderId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderService.getRota(orderId)
      // OSRM retorna a rota completa no osrm_url, 
      // mas aqui vamos desenhar os pontos direto da resposta (origin -> destination)
      // Para uma rota real curva, precisaríamos parsear o GeoJSON do OSRM.
      // Por enquanto, faremos a linha reta entre os pontos para visualização imediata.
      
      const origin: [number, number] = [data.origin.lat, data.origin.lng]
      const dest: [number, number] = [data.destination.lat, data.destination.lng]
      
      setDestination(dest)
      setRoute([origin, dest]) // Linha de percurso básica
      
      // Tentar buscar o trajeto real via OSRM API direta para desenho fluido
      const osrmRes = await fetch(data.osrm_url)
      const osrmData = await osrmRes.json()
      
      if (osrmData.routes && osrmData.routes.length > 0) {
        const coords = osrmData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
        setRoute(coords)
      }
    } catch (err) {
      setError("Não foi possível carregar o percurso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full relative w-full bg-[#111827]">
      <MapContainer 
        center={userPos || [-22.1062, -50.1740]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPos && (
          <Marker position={userPos}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}

        {destination && <Marker position={destination} />}

        {route.length > 0 && (
          <Polyline 
            positions={route} 
            pathOptions={{ color: '#2DCE89', weight: 6, opacity: 0.8 }} 
          />
        )}

        {userPos && <MapResizer center={userPos} />}
      </MapContainer>

      {/* Painel estilo Waze Superior Premium */}
      {activeOrderId && (
        <div className="absolute top-6 left-6 right-6 z-[1000] animate-in slide-in-from-top duration-700">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-[32px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-[#2DCE89] to-[#209a65] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#2DCE89]/20">
              <Navigation className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-1">Destino Ativo</p>
              <h3 className="text-sm font-black text-[#1A2B48] leading-tight tracking-tight">Percurso Monitorado GovTech</h3>
            </div>
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#2DCE89] border-t-transparent" />}
          </div>
        </div>
      )}

      {/* Botão de Centralizar Premium */}
      <button 
        onClick={() => {
          if (userPos) setUserPos([...userPos])
        }}
        className="absolute bottom-32 right-6 z-[1000] p-5 bg-white text-[#1A2B48] rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.2)] active:scale-90 transition-all hover:bg-[#F4F7FE]"
      >
        <LocateFixed className="w-7 h-7" />
      </button>

      {error && (
        <div className="absolute bottom-32 left-6 right-20 z-[1000] bg-red-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in zoom-in-95">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}
    </div>
  )
}
