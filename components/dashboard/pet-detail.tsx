'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  PawPrint, 
  Edit, 
  Trash2, 
  AlertTriangle,
  QrCode,
  MapPin,
  Clock,
  ArrowLeft,
  Download,
  Share2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Pet, QrScan, PetEvent } from '@/lib/types'
import { speciesLabels } from '@/lib/types'
import { QRCodeDisplay } from '@/components/dashboard/qr-code-display'
import { ScanHistory } from '@/components/dashboard/scan-history'
import { PetMap } from '@/components/dashboard/pet-map'

interface PetDetailProps {
  pet: Pet
  scans: QrScan[]
  events: PetEvent[]
}

export function PetDetail({ pet, scans, events }: PetDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingLost, setIsTogglingLost] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('pets').delete().eq('id', pet.id)
      router.push('/dashboard')
      router.refresh()
    } catch {
      setIsDeleting(false)
    }
  }

  const handleToggleLost = async () => {
    setIsTogglingLost(true)
    try {
      const supabase = createClient()
      const newIsLost = !pet.is_lost

      await supabase
        .from('pets')
        .update({ is_lost: newIsLost, updated_at: new Date().toISOString() })
        .eq('id', pet.id)

      // Create an event
      await supabase.from('pet_events').insert({
        pet_id: pet.id,
        event_type: newIsLost ? 'lost' : 'found',
        description: newIsLost 
          ? 'La mascota fue marcada como perdida'
          : 'La mascota fue marcada como encontrada',
      })

      router.refresh()
    } finally {
      setIsTogglingLost(false)
    }
  }

  const age = pet.birth_date
    ? Math.floor((Date.now() - new Date(pet.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{pet.name}</h1>
            {pet.is_lost && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Perdido
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {speciesLabels[pet.species]}
            {pet.breed && ` - ${pet.breed}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/pet/${pet.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion no se puede deshacer. Se eliminaran todos los datos de {pet.name}, 
                  incluyendo su historial de escaneos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Eliminar'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pet info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Photo */}
                <div className="sm:w-64 aspect-square relative bg-muted">
                  {pet.photo_url ? (
                    <Image
                      src={pet.photo_url}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <PawPrint className="h-20 w-20 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                {/* Details */}
                <div className="flex-1 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Especie</p>
                      <p className="font-medium">{speciesLabels[pet.species]}</p>
                    </div>
                    {pet.breed && (
                      <div>
                        <p className="text-sm text-muted-foreground">Raza</p>
                        <p className="font-medium">{pet.breed}</p>
                      </div>
                    )}
                    {pet.color && (
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-medium">{pet.color}</p>
                      </div>
                    )}
                    {age !== null && (
                      <div>
                        <p className="text-sm text-muted-foreground">Edad</p>
                        <p className="font-medium">
                          {age === 0 ? 'Menos de 1 año' : `${age} años`}
                        </p>
                      </div>
                    )}
                  </div>
                  {pet.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Notas</p>
                      <p className="text-sm">{pet.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lost mode toggle */}
          <Card className={pet.is_lost ? 'border-destructive' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${pet.is_lost ? 'text-destructive' : 'text-muted-foreground'}`} />
                Modo perdido
              </CardTitle>
              <CardDescription>
                {pet.is_lost 
                  ? 'Tu mascota esta marcada como perdida. Quien escanee el QR vera un mensaje de alerta.'
                  : 'Activa el modo perdido si tu mascota se ha extraviado.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant={pet.is_lost ? 'default' : 'destructive'} 
                onClick={handleToggleLost}
                disabled={isTogglingLost}
              >
                {isTogglingLost ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : pet.is_lost ? (
                  'Marcar como encontrado'
                ) : (
                  'Reportar como perdido'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tabs for history and map */}
          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Mapa
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
              <ScanHistory scans={scans} events={events} />
            </TabsContent>
            <TabsContent value="map" className="mt-4">
              <PetMap scans={scans} events={events} />
            </TabsContent>
          </Tabs>
        </div>

        {/* QR Code sidebar */}
        <div className="space-y-6">
          <QRCodeDisplay pet={pet} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estadisticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total escaneos</span>
                <span className="font-medium">{scans.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ultimo escaneo</span>
                <span className="text-sm">
                  {scans[0] 
                    ? new Date(scans[0].scanned_at).toLocaleDateString('es-MX')
                    : 'Nunca'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
