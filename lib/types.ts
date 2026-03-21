export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Pet {
  id: string
  user_id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed: string | null
  color: string | null
  birth_date: string | null
  photo_url: string | null
  qr_code: string
  is_lost: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface QrScan {
  id: string
  pet_id: string
  scanned_at: string
  latitude: number | null
  longitude: number | null
  finder_message: string | null
  finder_contact: string | null
  ip_address: string | null
  user_agent: string | null
}

export interface PetEvent {
  id: string
  pet_id: string
  event_type: 'lost' | 'found' | 'sighting' | 'scan'
  description: string | null
  latitude: number | null
  longitude: number | null
  reporter_contact: string | null
  created_at: string
}

export interface PetWithScans extends Pet {
  qr_scans?: QrScan[]
  pet_events?: PetEvent[]
}

export type Species = Pet['species']

export const speciesLabels: Record<Species, string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  rabbit: 'Conejo',
  other: 'Otro',
}

export const speciesIcons: Record<Species, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
}
