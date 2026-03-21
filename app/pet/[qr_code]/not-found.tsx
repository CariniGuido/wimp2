import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PawPrint, Search } from 'lucide-react'
import Link from 'next/link'

export default function PetNotFound() {
  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 text-primary mb-8">
          <PawPrint className="h-7 w-7" />
          <span className="text-xl font-bold">PetTag</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Mascota no encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              El codigo QR que escaneaste no corresponde a ninguna mascota registrada en nuestro sistema.
            </p>
            <p className="text-sm text-muted-foreground">
              Es posible que el codigo sea incorrecto o que la mascota haya sido eliminada del sistema.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
