import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PawPrint, QrCode, Bell, MapPin, Shield, Smartphone } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <PawPrint className="h-7 w-7" />
            <span className="text-xl font-bold">PetTag</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Iniciar sesion</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2 text-primary">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Proteccion inteligente para tu mascota</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Nunca pierdas de vista a tu{' '}
              <span className="text-primary">mejor amigo</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
              Registra a tu mascota, genera un codigo QR unico y recibe alertas instantaneas 
              cuando alguien lo escanee. La forma mas sencilla de reunirte con tu mascota si se pierde.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Registra tu mascota gratis
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#como-funciona">
                  Como funciona
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              En 3 simples pasos, tendras a tu mascota protegida
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Registra</h3>
                <p className="text-muted-foreground">
                  Crea una cuenta y registra los datos de tu mascota con una foto
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Genera el QR</h3>
                <p className="text-muted-foreground">
                  Obtendras un codigo QR unico que puedes imprimir y poner en su collar
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Recibe alertas</h3>
                <p className="text-muted-foreground">
                  Si alguien escanea el QR, recibiras una notificacion con su ubicacion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Caracteristicas</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Todo lo que necesitas para mantener segura a tu mascota
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">QR unico por mascota</h3>
                  <p className="text-sm text-muted-foreground">
                    Cada mascota tiene un codigo QR exclusivo que lleva a su perfil publico
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Notificaciones instantaneas</h3>
                  <p className="text-sm text-muted-foreground">
                    Recibe un email cada vez que alguien escanee el QR de tu mascota
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Mapa de avistamientos</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualiza en un mapa donde han escaneado el QR de tu mascota
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Modo perdido</h3>
                  <p className="text-sm text-muted-foreground">
                    Activa el modo perdido para alertar a quien escanee que tu mascota esta perdida
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Protege a tu mascota hoy
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
            Unete a miles de duenos responsables que ya protegen a sus mascotas con PetTag
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/sign-up">
              Crear cuenta gratis
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PawPrint className="h-5 w-5" />
              <span className="font-medium">PetTag</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 PetTag. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
