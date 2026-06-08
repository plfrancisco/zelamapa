import { useEffect, useState } from 'react'
import { MapPin, ChevronRight, AlertCircle, Inbox } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { orderService } from '../../api/orderService'
import type { OrdemResponse } from '../../api/orderService'
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
    <div className="h-full overflow-y-auto p-6 space-y-6 pb-20">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-black text-[#1A2B48] tracking-tight">Suas Missões</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Operação em Tempo Real</p>
        </div>
        <Badge className="bg-[#2DCE89]/10 text-[#2DCE89] border-none font-black px-4 py-1.5 rounded-full">{orders.length} TOTAL</Badge>
      </div>

      {error && (
        <div className="mx-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
            <Inbox className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-lg font-black text-[#1A2B48] opacity-20">Tudo limpo por aqui!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((ordem) => (
            <Card 
              key={ordem.id} 
              className={`border-none shadow-xl rounded-[32px] overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-300 hover:shadow-2xl ${
                ordem.status === 'ABERTA' ? 'bg-gradient-to-br from-white to-blue-50/30' : 'bg-white'
              }`}
              onClick={() => setSelectedOrder(ordem)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Prioridade</p>
                      <Badge className={
                        ordem.prioridade === 'URGENTE' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                        ordem.prioridade === 'ALTA' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' :
                        'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      }>
                        {ordem.prioridade}
                      </Badge>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        ordem.status === 'ABERTA' ? 'text-blue-500' :
                        ordem.status === 'ACEITA' ? 'text-yellow-500' :
                        ordem.status === 'EM_ROTA' ? 'text-orange-500' :
                        'text-[#2DCE89]'
                      }`}>
                        {ordem.status === 'ABERTA' ? 'DISPONÍVEL' : ordem.status.replace('_', ' ')}
                      </span>
                   </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-[#1A2B48] leading-tight tracking-tight line-clamp-2">
                    {ordem.descricao}
                  </h3>
                  
                  <div className="flex items-center gap-3 p-3 bg-[#F4F7FE] rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[#2DCE89]" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Localização</p>
                       <p className="text-xs font-bold text-[#1A2B48] truncate">{ordem.origem_endereco}</p>
                    </div>
                    <ChevronRight className="text-gray-300 w-5 h-5" />
                  </div>
                </div>
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
