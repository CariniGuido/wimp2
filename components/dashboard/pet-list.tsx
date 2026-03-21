'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PawPrint, QrCode, AlertTriangle, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Pet } from '@/lib/types'
import { speciesLabels } from '@/lib/types'

interface PetListProps {
  pets: Pet[]
}

export function PetList({ pets }: PetListProps) {
  if (pets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No tienes mascotas registradas</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            Registra tu primera mascota para generar un codigo QR unico que te ayudara a encontrarla si se pierde.
          </p>
          <Button asChild>
            <Link href="/dashboard/new">
              <Plus className="h-4 w-4 mr-2" />
              Registrar mi primera mascota
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => (
        <Link key={pet.id} href={`/dashboard/pet/${pet.id}`}>
          <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="aspect-square relative bg-muted">
              {pet.photo_url ? (
                <Image
                  src={pet.photo_url}
                  alt={pet.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PawPrint className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
              {pet.is_lost && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Perdido
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {speciesLabels[pet.species]}
                    {pet.breed && ` - ${pet.breed}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <QrCode className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
