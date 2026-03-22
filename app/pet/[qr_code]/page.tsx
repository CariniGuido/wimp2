import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicPetProfile } from '@/components/public/pet-profile'
import type { Pet } from '@/lib/types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'  // ← esto es lo nuevo

interface PageProps {
  params: Promise<{ qr_code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { qr_code } = await params
  const supabase = await createClient()

  const { data: pet } = await supabase
    .from('pets')
    .select('name, species, photo_url')
    .eq('qr_code', qr_code.trim())
    .single()

  if (!pet) {
    return { title: 'Mascota no encontrada - PetTag' }
  }

  return {
    title: `${pet.name} - PetTag`,
    description: `Perfil de ${pet.name}. Si encontraste a esta mascota, contacta a su dueño.`,
    openGraph: {
      title: `${pet.name} - PetTag`,
      description: `Perfil de ${pet.name}. Si encontraste a esta mascota, contacta a su dueño.`,
      images: pet.photo_url ? [pet.photo_url] : [],
    },
  }
}

export default async function PublicPetPage({ params }: PageProps) {
  const { qr_code } = await params

  console.log('=== DEBUG QR ===')
  console.log('QR CODE RECIBIDO:', qr_code)

  const supabase = await createClient()

  const { data: pet, error } = await supabase
    .from('pets')
    .select(`
      *,
      profiles:user_id (
        full_name,
        phone
      )
    `)
    .eq('qr_code', qr_code.trim())
    .single()

  console.log('PET ENCONTRADO:', pet ? pet.name : 'null')
  console.log('ERROR:', error ? error.message : 'ninguno')

  if (error || !pet) {
    console.log('Error buscando mascota:', error)
    notFound()
  }

  return (
    <PublicPetProfile
      pet={
        pet as Pet & {
          profiles: { full_name: string | null; phone: string | null }
        }
      }
    />
  )
}