import { createClient } from '@/lib/supabase/server'
import { PetList } from '@/components/dashboard/pet-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { Pet } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis mascotas</h1>
          <p className="text-muted-foreground">
            Administra los perfiles de tus mascotas
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva mascota
          </Link>
        </Button>
      </div>

      <PetList pets={(pets as Pet[]) || []} />
    </div>
  )
}
