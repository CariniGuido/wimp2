'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import type { Pet, Species } from '@/lib/types'
import { speciesLabels } from '@/lib/types'
import { nanoid } from 'nanoid'

interface PetFormProps {
  pet?: Pet
}

export function PetForm({ pet }: PetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet?.photo_url || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: pet?.name || '',
    species: pet?.species || 'dog' as Species,
    breed: pet?.breed || '',
    color: pet?.color || '',
    birth_date: pet?.birth_date || '',
    notes: pet?.notes || '',
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      let photoUrl = pet?.photo_url || null

      // Upload photo if new one selected
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${user.id}/${nanoid()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(fileName, photoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(fileName)

        photoUrl = publicUrl
      }

      if (pet) {
        // Update existing pet
        const { error: updateError } = await supabase
          .from('pets')
          .update({
            ...formData,
            photo_url: photoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pet.id)

        if (updateError) throw updateError
        router.push(`/dashboard/pet/${pet.id}`)
      } else {
        // Create new pet
        const qrCode = nanoid(12)
        
        const { data: newPet, error: insertError } = await supabase
          .from('pets')
          .insert({
            user_id: user.id,
            ...formData,
            photo_url: photoUrl,
            qr_code: qrCode,
          })
          .select()
          .single()

        if (insertError) throw insertError
        router.push(`/dashboard/pet/${newPet.id}`)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo upload */}
          <div className="space-y-2">
            <Label>Foto de tu mascota</Label>
            <div className="flex items-start gap-4">
              {photoPreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Subir foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre de tu mascota"
            />
          </div>

          {/* Species */}
          <div className="space-y-2">
            <Label htmlFor="species">Especie *</Label>
            <Select
              value={formData.species}
              onValueChange={(value: Species) => setFormData({ ...formData, species: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la especie" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(speciesLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="breed">Raza</Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="Ej: Labrador, Siames, etc."
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Ej: Negro, Blanco con manchas, etc."
            />
          </div>

          {/* Birth date */}
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de nacimiento</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Caracteristicas especiales, comportamiento, necesidades medicas, etc."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {pet ? 'Guardando...' : 'Registrando...'}
                </>
              ) : pet ? (
                'Guardar cambios'
              ) : (
                'Registrar mascota'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
