import { api } from './api'

export interface OrdemResponse {
  id: number
  uuid: string
  numero_os: string
  status: string
  prioridade: string
  origem_endereco: string
  origem_lat: number
  origem_lng: number
  destino_endereco: string
  destino_lat: number
  destino_lng: number
  data_inicio: string | null
  distancia_km: number | null
  ocorrencia_id: number
  descricao: string
  imagem_path: string | null
  tipo_nome: string | null
}

export const orderService = {
  getMinhasOrdens: async (): Promise<OrdemResponse[]> => {
    const res = await api.get('/services/ordens/minhas')
    return res.data
  },

  getPendentes: async (): Promise<OrdemResponse[]> => {
    const res = await api.get('/services/ordens/pendentes')
    return res.data
  },

  aceitar: async (ordemId: number, motivo_recusa?: string) => {
    await api.put(`/services/ordens/${ordemId}/aceitar`, { motivo_recusa })
  },

  iniciar: async (ordemId: number) => {
    await api.put(`/services/ordens/${ordemId}/iniciar`)
  },

  concluir: async (ordemId: number) => {
    await api.put(`/services/ordens/${ordemId}/concluir`)
  },

  recusar: async (ordemId: number, motivo: string) => {
    await api.put(`/services/ordens/${ordemId}/recusar`, { motivo_recusa: motivo })
  },

  getRota: async (ordemId: number) => {
    const res = await api.get(`/services/ordens/${ordemId}/rota`)
    return res.data
  },
}
