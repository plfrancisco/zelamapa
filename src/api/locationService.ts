import { api } from './api'

export interface LocationPoint {
  latitude: number
  longitude: number
  velocidade?: number
  heading?: number
  timestamp?: string
  ordem_id?: number
  bateria_restante?: number
  modulo_tipo?: string
}

export const locationService = {
  sendBatch: async (locations: LocationPoint[]) => {
    try {
      const res = await api.post('/api/localizacao/batch', { localizacoes: locations })
      return res.data
    } catch (err) {
      console.error('[LocationService] Failed to send batch:', err)
      throw err
    }
  },

  getUltima: async (motoristaId: number) => {
    const res = await api.get(`/api/localizacao/ultima/${motoristaId}`)
    return res.data
  }
}
