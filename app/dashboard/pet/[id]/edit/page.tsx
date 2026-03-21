import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PetForm } from '@/components/dashboard/pet-form'
import type { Pet } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPetPage({ params }: PageProps) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar mascota</h1>
        <p className="text-muted-foreground">
          Actualiza los datos de {pet.name}
        </p>
      </div>

      <PetForm pet={pet as Pet} />
    </div>
  )
}
