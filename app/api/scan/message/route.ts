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
          finder_message: message,
          finder_contact: contact || null,
          latitude: latitude || null,
          longitude: longitude || null,
        })
        .eq('id', recentScan.id)
    } else {
      // Create a new scan record if none exists
      await supabase
        .from('qr_scans')
        .insert({
          pet_id,
          finder_message: message,
          finder_contact: contact || null,
          latitude: latitude || null,
          longitude: longitude || null,
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

    // Get pet and owner info for notification
    const { data: pet } = await supabase
      .from('pets')
      .select('name, user_id, is_lost')
      .eq('id', pet_id)
      .single()

    if (pet) {
      // Get owner's email using admin API
      const { data: { user } } = await supabase.auth.admin.getUserById(pet.user_id)
      
      if (user?.email) {
        await sendMessageNotification({
          to: user.email,
          petName: pet.name,
          message,
          contact,
          location: latitude && longitude ? { lat: latitude, lng: longitude } : null,
          isLost: pet.is_lost,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Message API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendMessageNotification(params: {
  to: string
  petName: string
  message: string
  contact?: string
  location: { lat: number; lng: number } | null
  isLost: boolean
}) {
  const { to, petName, message, contact, location, isLost } = params

  if (!process.env.RESEND_API_KEY) {
    console.log('Message notification skipped (no RESEND_API_KEY):', params)
    return
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const locationText = location
      ? `<p><strong>Ubicacion:</strong> <a href="https://maps.google.com/?q=${location.lat},${location.lng}">Ver en mapa</a></p>`
      : ''

    const contactText = contact
      ? `<p><strong>Contacto del remitente:</strong> ${contact}</p>`
      : ''

    const urgentText = isLost
      ? '<p style="color: red; font-weight: bold;">Tu mascota esta marcada como PERDIDA. Alguien te ha enviado un mensaje.</p>'
      : ''

    await resend.emails.send({
      from: 'PetTag <notifications@pettag.app>',
      to: [to],
      subject: `${isLost ? '[URGENTE] ' : ''}Mensaje sobre ${petName}`,
      html: `
        <h2>Has recibido un mensaje sobre ${petName}</h2>
        ${urgentText}
        <p><strong>Mensaje:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 16px; margin: 16px 0;">
          ${message}
        </blockquote>
        ${contactText}
        ${locationText}
        <p><small>Fecha y hora: ${new Date().toLocaleString('es-MX')}</small></p>
      `,
    })

    console.log('Message notification email sent to:', to)
  } catch (error) {
    console.error('Failed to send message notification email:', error)
  }
}
