import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicPetProfile } from '@/components/public/pet-profile'
import type { Pet } from '@/lib/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ qr_code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { qr_code } = await params
  const supabase = await createClient()
  
  const { data: pet } = await supabase
    .from('pets')
    .select('name, species, photo_url')
    .eq('qr_code', qr_code)
    .single()

  if (!pet) {
    return {
      title: 'Mascota no encontrada - PetTag',
    }
  }

  return {
    title: `${pet.name} - PetTag`,
    description: `Perfil de ${pet.name}. Si encontraste a esta mascota, contacta a su dueno.`,
    openGraph: {
      title: `${pet.name} - PetTag`,
      description: `Perfil de ${pet.name}. Si encontraste a esta mascota, contacta a su dueno.`,
      images: pet.photo_url ? [pet.photo_url] : [],
    },
  }
}

export default async function PublicPetPage({ params }: PageProps) {
  const { qr_code } = await params
  const supabase = await createClient()

  // Get pet with owner info
  const { data: pet } = await supabase
    .from('pets')
    .select(`
      *,
      profiles:user_id (
        full_name,
        phone
      )
    `)
    .eq('qr_code', qr_code)
    .single()

  if (!pet) {
    notFound()
  }

  // Log the scan (we'll do this server-side for better reliability)
  // The actual location will be captured client-side

  return <PublicPetProfile pet={pet as Pet & { profiles: { full_name: string | null; phone: string | null } }} />
}
