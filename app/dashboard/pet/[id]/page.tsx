import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PetDetail } from '@/components/dashboard/pet-detail'
import type { Pet, QrScan, PetEvent } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PetDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: pet } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!pet) {
    notFound()
  }

  // Get recent scans
  const { data: scans } = await supabase
    .from('qr_scans')
    .select('*')
    .eq('pet_id', id)
    .order('scanned_at', { ascending: false })
    .limit(10)

  // Get pet events
  const { data: events } = await supabase
    .from('pet_events')
    .select('*')
    .eq('pet_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <PetDetail 
      pet={pet as Pet} 
      scans={(scans as QrScan[]) || []} 
      events={(events as PetEvent[]) || []}
    />
  )
}
