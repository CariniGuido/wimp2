'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Maximize2, X } from 'lucide-react'
import type { QrScan, PetEvent } from '@/lib/types'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

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
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const points: MapPoint[] = [
    ...(scans as any[])
      .filter((s) => s.scanner_location_lat && s.scanner_location_lng)
      .map((s) => ({
        id: s.id,
        lat: s.scanner_location_lat,
        lng: s.scanner_location_lng,
        type: 'scan' as const,
        date: s.scanned_at,
        description: s.scanner_message || 'QR escaneado',
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

  const center = {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  }

  if (!isMounted) {
    return (
      <Card>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Cargando mapa...</p>
        </CardContent>
      </Card>
    )
  }

  // Paw icon using divIcon
  const getPawIcon = (type: string) => {
    const L = require('leaflet')
    const emoji = type === 'lost' ? '🚨' : type === 'found' ? '✅' : type === 'sighting' ? '👁️' : '🐾'
    return L.divIcon({
      html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.3))">${emoji}</div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    })
  }

  return (
    <>
      {/* Mini mapa */}
      <Card 
  className={`overflow-hidden cursor-pointer transition-opacity duration-300 ${expanded ? 'opacity-20' : 'opacity-100'}`}
  onClick={() => setExpanded(true)}
>
        <CardContent className="p-0 relative">
          <div className="h-[200px] pointer-events-none">
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={13}
              className="h-full w-full"
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.map((point) => (
                <Marker
                  key={point.id}
                  position={[point.lat, point.lng]}
                  icon={getPawIcon(point.type)}
                />
              ))}
            </MapContainer>
          </div>
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Maximize2 className="h-5 w-5 text-gray-700" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-white rounded px-2 py-1 text-xs text-gray-600 shadow">
            {points.length} ubicacion{points.length !== 1 ? 'es' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Mapa expandido (modal) */}
      {expanded && (
        <div
        className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-medium">Ubicaciones registradas</span>
              <button onClick={() => setExpanded(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            <div className="h-[500px]">
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
                  <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={getPawIcon(point.type)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-medium">{getTypeLabel(point.type)}</p>
                        <p>{point.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(point.date).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'scan': return 'Escaneo QR'
    case 'lost': return 'Reportado perdido'
    case 'found': return 'Encontrado'
    case 'sighting': return 'Avistamiento'
    default: return 'Evento'
  }
}
