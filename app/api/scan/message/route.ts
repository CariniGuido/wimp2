import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pet_id, message, contact, latitude, longitude } = body

    if (!pet_id || !message) {
      return NextResponse.json(
        { error: 'pet_id and message are required' }, 
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update the most recent scan with the message
    const { data: recentScan } = await supabase
      .from('qr_scans')
      .select('id')
      .eq('pet_id', pet_id)
      .order('scanned_at', { ascending: false })
      .limit(1)
      .single()

    if (recentScan) {
      await supabase
        .from('qr_scans')
        .update({
          scanner_message: message,
          scanner_contact: contact || null,
          scanner_location_lat: latitude || null,
          scanner_location_lng: longitude || null,
        })
        .eq('id', recentScan.id)
    } else {
      await supabase
        .from('qr_scans')
        .insert({
          pet_id,
          scanner_message: message,
          scanner_contact: contact || null,
          scanner_location_lat: latitude || null,
          scanner_location_lng: longitude || null,
        })
    }

    // Also create an event for the sighting
    await supabase.from('pet_events').insert({
      pet_id,
      event_type: 'sighting',
      description: message,
      latitude: latitude || null,
      longitude: longitude || null,
      reporter_contact: contact || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Message API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}