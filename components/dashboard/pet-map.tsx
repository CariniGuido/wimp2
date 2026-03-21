'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import type { QrScan, PetEvent } from '@/lib/types'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface PetMapProps {
  scans: QrScan[]
  events: PetEvent[]
}

type MapPoint = {
  id: string
  lat: number
  lng: number
  type: 'scan' | 'sighting' | 'lost' | 'found'
  date: string
  description: string
}

export function PetMap({ scans, events }: PetMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Collect all points with coordinates
  const points: MapPoint[] = [
    ...scans
      .filter((s) => s.latitude && s.longitude)
      .map((s) => ({
        id: s.id,
        lat: s.latitude!,
        lng: s.longitude!,
        type: 'scan' as const,
        date: s.scanned_at,
        description: s.finder_message || 'QR escaneado',
      })),
    ...events
      .filter((e) => e.latitude && e.longitude)
      .map((e) => ({
        id: e.id,
        lat: e.latitude!,
        lng: e.longitude!,
        type: e.event_type as MapPoint['type'],
        date: e.created_at,
        description: e.description || 'Evento registrado',
      })),
  ]

  if (points.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-center">
            No hay ubicaciones registradas
          </p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Cuando alguien escanee el QR con ubicacion, aparecera en el mapa
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate center based on points
  const center = {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  }

  if (!isMounted) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Cargando mapa...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 h-[400px]">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point) => (
            <Marker key={point.id} position={[point.lat, point.lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{getTypeLabel(point.type)}</p>
                  <p className="text-muted-foreground">{point.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(point.date).toLocaleString('es-MX')}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  )
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'scan':
      return 'Escaneo QR'
    case 'lost':
      return 'Reportado perdido'
    case 'found':
      return 'Encontrado'
    case 'sighting':
      return 'Avistamiento'
    default:
      return 'Evento'
  }
}
