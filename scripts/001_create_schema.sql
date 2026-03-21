-- Pet Management App Database Schema

-- 1. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- 2. Pets table
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'dog',
  breed TEXT,
  color TEXT,
  age_years INTEGER,
  weight_kg DECIMAL(5,2),
  photo_url TEXT,
  qr_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  is_lost BOOLEAN DEFAULT FALSE,
  lost_at TIMESTAMPTZ,
  lost_location_lat DECIMAL(10,8),
  lost_location_lng DECIMAL(11,8),
  lost_description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_select_own" ON public.pets 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pets_insert_own" ON public.pets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pets_update_own" ON public.pets 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pets_delete_own" ON public.pets 
  FOR DELETE USING (auth.uid() = user_id);

-- Public policy for viewing pets by QR code (anyone can view)
CREATE POLICY "pets_select_by_qr" ON public.pets 
  FOR SELECT USING (TRUE);

-- 3. QR Scans table (logs when someone scans a pet's QR)
CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scanner_ip TEXT,
  scanner_location_lat DECIMAL(10,8),
  scanner_location_lng DECIMAL(11,8),
  scanner_message TEXT,
  scanner_contact TEXT,
  notified_owner BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Pet owners can view scans of their pets
CREATE POLICY "qr_scans_select_own" ON public.qr_scans 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = qr_scans.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Anyone can insert a scan (public QR scanning)
CREATE POLICY "qr_scans_insert_public" ON public.qr_scans 
  FOR INSERT WITH CHECK (TRUE);

-- 4. Pet Events table (sightings, found reports, etc.)
CREATE TABLE IF NOT EXISTS public.pet_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'sighting',
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_address TEXT,
  description TEXT,
  reporter_contact TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pet_events ENABLE ROW LEVEL SECURITY;

-- Pet owners can view events for their pets
CREATE POLICY "pet_events_select_own" ON public.pet_events 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_events.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Anyone can insert an event (public reporting)
CREATE POLICY "pet_events_insert_public" ON public.pet_events 
  FOR INSERT WITH CHECK (TRUE);

-- 5. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pet photos
CREATE POLICY "pet_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "pet_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "pet_photos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pet-photos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "pet_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-photos' 
    AND auth.uid() IS NOT NULL
  );
