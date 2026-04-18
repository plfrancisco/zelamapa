import React from 'react'
import { 
  X, MapPin, Package, CheckCircle, 
  Navigation, AlertCircle
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { orderService, type OrdemResponse } from '../../services/orderService'

interface OrderDetailModalProps {
  order: OrdemResponse | null
  onClose: () => void
  onActionComplete: () => void
}

export default function OrderDetailModal({ order, onClose, onActionComplete }: OrderDetailModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!order) return null

  const handleAction = async (action: 'aceitar' | 'iniciar' | 'concluir' | 'recusar') => {
    setLoading(true)
    setError(null)
    try {
      if (action === 'aceitar') await orderService.aceitar(order.id)
      else if (action === 'iniciar') await orderService.iniciar(order.id)
      else if (action === 'concluir') await orderService.concluir(order.id)
      
      onActionComplete()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao processar ação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] w-full max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-gray-800 overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header com imagem */}
        <div className="relative h-48 bg-gray-900">
          {order.imagem_path ? (
            <img 
              src={`http://localhost:8000/uploads/${order.imagem_path.split('/').pop()}`} 
              alt="Ocorrência" 
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
              <Package className="w-12 h-12 mb-2" />
              <p className="text-sm">Sem imagem anexada</p>
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4">
            <Badge className={
              order.prioridade === 'URGENTE' ? 'bg-red-500 text-white' :
              order.prioridade === 'ALTA' ? 'bg-orange-500 text-white' :
              'bg-blue-500 text-white'
            }>
              {order.prioridade}
            </Badge>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-6">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-bold text-white">{order.tipo_nome || 'Ordem de Serviço'}</h3>
              <span className="text-xs text-gray-500 font-mono">{order.numero_os}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{order.descricao}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Origem</p>
                <p className="text-sm text-gray-200">{order.origem_endereco}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2DCE89]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-[#2DCE89]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Destino (Descarte/Base)</p>
                <p className="text-sm text-gray-200">{order.destino_endereco}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-2">
            {order.status === 'ABERTA' && (
              <>
                <Button 
                  disabled={loading}
                  onClick={() => handleAction('aceitar')}
                  className="flex-1 bg-[#2DCE89] hover:bg-[#25b377] h-12 font-bold"
                >
                  {loading ? 'Aceitando...' : 'Aceitar Ordem'}
                </Button>
                <Button 
                  variant="outline"
                  disabled={loading}
                  className="border-gray-700 text-gray-400 hover:bg-gray-800 h-12 px-6"
                >
                  <X className="w-5 h-5" />
                </Button>
              </>
            )}

            {order.status === 'ACEITA' && (
              <Button 
                disabled={loading}
                onClick={() => handleAction('iniciar')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 font-bold gap-2"
              >
                <Navigation className="w-5 h-5" />
                {loading ? 'Iniciando...' : 'Iniciar Rota'}
              </Button>
            )}

            {order.status === 'EM_ROTA' && (
              <Button 
                disabled={loading}
                onClick={() => handleAction('concluir')}
                className="flex-1 bg-green-600 hover:bg-green-700 h-12 font-bold gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Concluindo...' : 'Marcar como Concluído'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
