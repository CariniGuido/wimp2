import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PawPrint, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PetNotFound() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <PawPrint className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Mascota no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            La mascota que buscas no existe o no tienes permiso para verla.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a mis mascotas
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
