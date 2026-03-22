import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pet_id, latitude, longitude } = body

    if (!pet_id) {
      return NextResponse.json({ error: 'pet_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const headersList = await headers()

    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0] || headersList.get('x-real-ip') || null

    // Insert scan record using correct column names from schema
    const { data: scan, error: scanError } = await supabase
      .from('qr_scans')
      .insert({
        pet_id,
        scanner_location_lat: latitude || null,
        scanner_location_lng: longitude || null,
        scanner_ip: ipAddress,
      })
      .select()
      .single()

    if (scanError) {
      console.error('Error logging scan:', scanError)
      // Don't fail the request if scan logging fails
    }

    return NextResponse.json({ success: true, scan })
  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
