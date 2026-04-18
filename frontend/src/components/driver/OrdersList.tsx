import { useEffect, useState } from 'react'
import { MapPin, ChevronRight, AlertCircle, Inbox } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { orderService } from '../../services/orderService'
import type { OrdemResponse } from '../../services/orderService'
import OrderDetailModal from './OrderDetailModal'

interface OrdersListProps {
  onOrderAction: (orderId: number) => void
}

export default function OrdersList({ onOrderAction }: OrdersListProps) {
  const [orders, setOrders] = useState<OrdemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrdemResponse | null>(null)

  const fetchOrders = async () => {
    try {
      const [mine, pending] = await Promise.all([
        orderService.getMinhasOrdens(),
        orderService.getPendentes()
      ])
      
      const combined = [...mine]
      pending.forEach(p => {
        if (!combined.find(m => m.id === p.id)) {
          combined.push(p)
        }
      })

      const sorted = combined.sort((a, b) => {
        const prioMap: Record<string, number> = { 'URGENTE': 0, 'ALTA': 1, 'MEDIA': 2, 'BAIXA': 3 }
        return (prioMap[a.prioridade] ?? 4) - (prioMap[b.prioridade] ?? 4)
      })

      setOrders(sorted)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ordens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 20000)
    return () => clearInterval(interval)
  }, [])

  if (loading && orders.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2DCE89]"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-xl font-bold text-white">Ordens</h2>
        <Badge className="bg-[#2DCE89]/20 text-[#2DCE89] border-none">{orders.length} total</Badge>
      </div>

      {error && (
        <div className="mx-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <Inbox className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Tudo limpo por aqui!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((ordem) => (
            <Card 
              key={ordem.id} 
              className={`border-gray-800 text-white cursor-pointer active:scale-[0.98] transition-all hover:bg-[#252a3a] ${
                ordem.status === 'ABERTA' ? 'bg-[#1e293b]' : 'bg-[#1a1f2e]'
              }`}
              onClick={() => setSelectedOrder(ordem)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      ordem.status === 'ABERTA' ? 'bg-blue-500 text-white' :
                      ordem.status === 'ACEITA' ? 'bg-yellow-500/20 text-yellow-400' :
                      ordem.status === 'EM_ROTA' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }>
                      {ordem.status === 'ABERTA' ? 'NOVO' : ordem.status}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm line-clamp-1">{ordem.descricao}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-[#2DCE89]" />
                    <span className="truncate">{ordem.origem_endereco}</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-600 w-5 h-5" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onActionComplete={() => {
            fetchOrders();
            if (selectedOrder.status === 'ABERTA' || selectedOrder.status === 'ACEITA') {
              onOrderAction(selectedOrder.id);
            }
          }}
        />
      )}
    </div>
  )
}
