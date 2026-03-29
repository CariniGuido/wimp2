import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

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
    }

    const { data: pet } = await supabase
      .from('pets')
      .select('name, user_id')
      .eq('id', pet_id)
      .single()

    if (pet) {
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', pet.user_id)

      if (subscriptions && subscriptions.length > 0) {
        const locationText = latitude && longitude
          ? `📍 Ver ubicación: https://maps.google.com/?q=${latitude},${longitude}`
          : 'Alguien encontró a tu mascota.'

        const payload = JSON.stringify({
          title: `🐾 ¡Escanearon el QR de ${pet.name}!`,
          body: locationText,
          url: `/dashboard`,
        })

        await Promise.allSettled(
          subscriptions.map((sub) =>
            webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            )
          )
        )
      }
    }

    return NextResponse.json({ success: true, scan })
  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}