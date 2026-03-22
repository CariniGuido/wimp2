'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2, ExternalLink } from 'lucide-react'
import type { Pet } from '@/lib/types'

interface QRCodeDisplayProps {
  pet: Pet
}

export function QRCodeDisplay({ pet }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  
  // Safe for SSR - window only exists in browser
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wimp2-one.vercel.app'
  const petUrl = `${origin}/pet/${pet.qr_code}`

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const padding = 40
      canvas.width = img.width + padding * 2
      canvas.height = img.height + padding * 2

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, padding, padding)

      ctx.fillStyle = '#1a1a1a'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(pet.name, canvas.width / 2, canvas.height - 12)

      const link = document.createElement('a')
      link.download = `qr-${pet.name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR de ${pet.name}`,
          text: `Escanea este codigo QR para ver el perfil de ${pet.name}`,
          url: petUrl,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(petUrl)
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Codigo QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={qrRef}
          className="flex justify-center p-4 bg-white rounded-lg"
        >
          <QRCodeSVG
            value={petUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Imprime este codigo y ponlo en el collar de {pet.name}
        </p>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="w-full" asChild>
          <a href={petUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver pagina publica
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
