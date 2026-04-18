import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:8000'

class SocketService {
  public driverSocket: Socket | null = null
  public managerSocket: Socket | null = null

  // --- MOTORISTA ---
  connectDriver(motoristaId: number) {
    if (this.driverSocket) return
    this.driverSocket = io(`${SOCKET_URL}/driver`, {
      auth: { motorista_id: motoristaId },
      transports: ['websocket']
    })
  }

  disconnectDriver() {
    this.driverSocket?.disconnect()
    this.driverSocket = null
  }

  // --- GESTOR ---
  connectManager(userId: number) {
    if (this.managerSocket) return
    this.managerSocket = io(`${SOCKET_URL}/manager`, {
      auth: { user_id: userId },
      transports: ['websocket']
    })
    console.log('[Socket] Manager connecting...')
  }

  disconnectManager() {
    this.managerSocket?.disconnect()
    this.managerSocket = null
  }

  // Ouvir movimento de motoristas (para o mapa do dashboard)
  onMotoristaMovimento(callback: (data: any) => void) {
    this.managerSocket?.on('motorista_movimento', callback)
  }

  // Ouvir atualizações de status/ordens
  onOrdemAtualizada(callback: (data: any) => void) {
    this.managerSocket?.on('ordem_atualizada', callback)
  }
  
  onMotoristaStatus(callback: (data: any) => void) {
    this.managerSocket?.on('motorista_status', callback)
  }

  // Callbacks para o App Motorista
  onNovaOrdem(callback: (data: any) => void) {
    this.driverSocket?.on('nova_ordem', callback)
  }
}

export const socketService = new SocketService()
