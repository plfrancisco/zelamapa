import { useState, useEffect, useRef } from 'react'
import { locationService, type LocationPoint } from '../api/locationService'

export function useGeolocation(enabled: boolean = true) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bufferRef = useRef<LocationPoint[]>([])
  
  // Função para enviar o buffer para o backend
  const flushBuffer = async () => {
    if (bufferRef.current.length === 0) return
    
    const dataToSend = [...bufferRef.current]
    bufferRef.current = [] // Limpa buffer imediatamente para evitar duplicatas
    
    try {
      await locationService.sendBatch(dataToSend)
      console.log(`[Geo] Sent ${dataToSend.length} points to server`)
    } catch (err) {
      // Se falhar, re-adiciona ao buffer para tentar depois
      bufferRef.current = [...dataToSend, ...bufferRef.current]
    }
  }

  useEffect(() => {
    if (!enabled || !("geolocation" in navigator)) {
      setError("Geolocalização não disponível")
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos)
        setError(null)

        // Adiciona ao buffer
        const point: LocationPoint = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          velocidade: pos.coords.speed || 0,
          heading: pos.coords.heading || 0,
          timestamp: new Date(pos.timestamp).toISOString(),
          modulo_tipo: 'APP'
        }
        
        bufferRef.current.push(point)
        
        // Se acumulou 5 pontos, envia imediatamente
        if (bufferRef.current.length >= 5) {
          flushBuffer()
        }
      },
      (err) => {
        setError(err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )

    // Intervalo de segurança para enviar dados mesmo se não houver movimento
    const intervalId = setInterval(flushBuffer, 30000)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      clearInterval(intervalId)
      flushBuffer() // Tenta enviar o que restou ao desmontar
    }
  }, [enabled])

  return { position, error }
}
