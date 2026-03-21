import { PetForm } from '@/components/dashboard/pet-form'

export default function NewPetPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar mascota</h1>
        <p className="text-muted-foreground">
          Completa los datos de tu mascota para generar su codigo QR unico
        </p>
      </div>

      <PetForm />
    </div>
  )
}
