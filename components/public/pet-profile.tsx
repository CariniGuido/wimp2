'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  PawPrint, 
  Phone, 
  AlertTriangle, 
  MapPin, 
  MessageSquare,
  Send,
  Loader2,
  Check
} from 'lucide-react'
import Image from 'next/image'
import type { Pet } from '@/lib/types'
import { speciesLabels } from '@/lib/types'

interface PublicPetProfileProps {
  pet: Pet & { 
    profiles: { 
      full_name: string | null
      phone: string | null 
    } 
  }
}

export function PublicPetProfile({ pet }: PublicPetProfileProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [scanLogged, setScanLogged] = useState(false)

  // Get user location and log the scan on page load
  useEffect(() => {
    if (scanLogged) return

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Location denied or unavailable - still log the scan
        }
      )
    }

    // Log the scan
    const logScan = async () => {
      try {
        await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pet_id: pet.id,
            latitude: location?.lat,
            longitude: location?.lng,
          }),
        })
        setScanLogged(true)
      } catch {
        // Silently fail
      }
    }

    // Small delay to allow location to be captured
    const timer = setTimeout(logScan, 1000)
    return () => clearTimeout(timer)
  }, [pet.id, location, scanLogged])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSending(true)
    try {
      await fetch('/api/scan/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet_id: pet.id,
          message,
          contact,
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      })
      setSent(true)
    } catch {
      alert('Error al enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const age = pet.birth_date
    ? Math.floor((Date.now() - new Date(pet.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="min-h-svh bg-background">
      {/* Lost banner */}
      {pet.is_lost && (
        <div className="bg-destructive text-destructive-foreground py-3 px-4">
          <div className="container mx-auto flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Esta mascota esta reportada como perdida</span>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-lg px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 text-primary mb-8">
          <PawPrint className="h-7 w-7" />
          <span className="text-xl font-bold">PetTag</span>
        </div>

        {/* Pet card */}
        <Card className="mb-6 overflow-hidden">
          {/* Photo */}
          <div className="aspect-square relative bg-muted">
            {pet.photo_url ? (
              <Image
                src={pet.photo_url}
                alt={pet.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <PawPrint className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
            {pet.is_lost && (
              <div className="absolute top-4 right-4">
                <Badge variant="destructive" className="text-base px-3 py-1">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  PERDIDO
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">
              {speciesLabels[pet.species]}
              {pet.breed && ` - ${pet.breed}`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
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
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Informacion adicional</p>
                <p className="text-sm">{pet.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Owner contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Contactar al dueno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pet.profiles?.full_name && (
              <p className="font-medium">{pet.profiles.full_name}</p>
            )}
            
            {pet.profiles?.phone && (
              <Button className="w-full" size="lg" asChild>
                <a href={`tel:${pet.profiles.phone}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  Llamar: {pet.profiles.phone}
                </a>
              </Button>
            )}

            {location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Tu ubicacion ha sido compartida para ayudar a localizar a la mascota
              </p>
            )}
          </CardContent>
        </Card>

        {/* Send message form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Enviar mensaje al dueno
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Mensaje enviado</h3>
                <p className="text-sm text-muted-foreground">
                  El dueno ha sido notificado. Gracias por tu ayuda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Ej: Encontre a tu mascota cerca del parque..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Tu contacto (opcional)</Label>
                  <Input
                    id="contact"
                    placeholder="Tu telefono o email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSending || !message.trim()}>
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Protegido con PetTag - Sistema de identificacion QR para mascotas
        </p>
      </div>
    </div>
  )
}
