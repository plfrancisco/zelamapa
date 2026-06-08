import { io, Socket } from 'socket.io-client'
import { API_URL } from './api'

class SocketService {
  public driverSocket: Socket | null = null
  public managerSocket: Socket | null = null

  // --- MOTORISTA ---
  connectDriver(motoristaId: number) {
    if (this.driverSocket) return
    this.driverSocket = io(`${API_URL}/driver`, {
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
    this.managerSocket = io(`${API_URL}/manager`, {
      auth: { user_id: userId },
      transports: ['websocket']
    })
    console.log('[Socket] Manager connecting to:', API_URL)
  }

  disconnectManager() {
    this.managerSocket?.disconnect()
    this.managerSocket = null
  }

  onMotoristaMovimento(callback: (data: any) => void) {
    this.managerSocket?.on('motorista_movimento', callback)
  }

  onOrdemAtualizada(callback: (data: any) => void) {
    this.managerSocket?.on('ordem_atualizada', callback)
  }
  
  onMotoristaStatus(callback: (data: any) => void) {
    this.managerSocket?.on('motorista_status', callback)
  }

  onNovaOrdem(callback: (data: any) => void) {
    this.driverSocket?.on('nova_ordem', callback)
  }
}

export const socketService = new SocketService()
