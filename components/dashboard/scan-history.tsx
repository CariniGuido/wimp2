'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, MapPin, Eye, AlertTriangle, Check } from 'lucide-react'
import type { QrScan, PetEvent } from '@/lib/types'

interface ScanHistoryProps {
  scans: QrScan[]
  events: PetEvent[]
}

type TimelineItem = {
  id: string
  type: 'scan' | 'lost' | 'found' | 'sighting'
  date: string
  description: string
  location?: { lat: number; lng: number }
  contact?: string
}

export function ScanHistory({ scans, events }: ScanHistoryProps) {
  const timeline: TimelineItem[] = [
    ...scans.map((scan: any) => ({
      id: scan.id,
      type: 'scan' as const,
      date: scan.scanned_at,
      description: scan.scanner_message || 'Codigo QR escaneado',
      location: scan.scanner_location_lat && scan.scanner_location_lng
        ? { lat: scan.scanner_location_lat, lng: scan.scanner_location_lng }
        : undefined,
      contact: scan.scanner_contact || undefined,
    })),
    ...events.map((event) => ({
      id: event.id,
      type: event.event_type as TimelineItem['type'],
      date: event.created_at,
      description: event.description || getEventDescription(event.event_type),
      location: event.latitude && event.longitude
        ? { lat: event.latitude, lng: event.longitude }
        : undefined,
      contact: event.reporter_contact || undefined,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <QrCode className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-center">
            Aun no hay escaneos ni eventos registrados
          </p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Cuando alguien escanee el QR de tu mascota, aparecera aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div 
              key={item.id} 
              className={`flex gap-4 ${index !== timeline.length - 1 ? 'pb-4 border-b' : ''}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getBadgeVariant(item.type)}>
                    {getTypeLabel(item.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.date)}
                  </span>
                </div>
                <p className="text-sm">{item.description}</p>
                {item.location && (
                  <a
                    href={`https://maps.google.com/?q=${item.location.lat},${item.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
                  >
                    <MapPin className="h-3 w-3" />
                    Ver en mapa ({item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)})
                  </a>
                )}
                {item.contact && (
                  <p className="text-xs text-primary mt-1">
                    Contacto: {item.contact}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getEventDescription(type: string): string {
  switch (type) {
    case 'lost': return 'Mascota marcada como perdida'
    case 'found': return 'Mascota marcada como encontrada'
    case 'sighting': return 'Avistamiento reportado'
    default: return 'Evento registrado'
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'scan': return <QrCode className="h-5 w-5 text-primary" />
    case 'lost': return <AlertTriangle className="h-5 w-5 text-destructive" />
    case 'found': return <Check className="h-5 w-5 text-green-600" />
    case 'sighting': return <Eye className="h-5 w-5 text-blue-600" />
    default: return <QrCode className="h-5 w-5 text-muted-foreground" />
  }
}

function getIconBg(type: string): string {
  switch (type) {
    case 'scan': return 'bg-primary/10'
    case 'lost': return 'bg-destructive/10'
    case 'found': return 'bg-green-100'
    case 'sighting': return 'bg-blue-100'
    default: return 'bg-muted'
  }
}

function getBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'lost': return 'destructive'
    case 'found': return 'default'
    default: return 'secondary'
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'scan': return 'Escaneo'
    case 'lost': return 'Perdido'
    case 'found': return 'Encontrado'
    case 'sighting': return 'Avistamiento'
    default: return 'Evento'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}