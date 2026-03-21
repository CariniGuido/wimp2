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

    // Get request metadata
    const userAgent = headersList.get('user-agent') || null
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0] || headersList.get('x-real-ip') || null

    // Insert scan record
    const { data: scan, error: scanError } = await supabase
      .from('qr_scans')
      .insert({
        pet_id,
        latitude: latitude || null,
        longitude: longitude || null,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (scanError) {
      console.error('Error logging scan:', scanError)
      return NextResponse.json({ error: 'Failed to log scan' }, { status: 500 })
    }

    // Get pet and owner info for notification
    const { data: pet } = await supabase
      .from('pets')
      .select(`
        *,
        profiles:user_id (
          full_name
        )
      `)
      .eq('id', pet_id)
      .single()

    if (pet) {
      // Get owner's email
      const { data: { user } } = await supabase.auth.admin.getUserById(pet.user_id)
      
      if (user?.email) {
        // Send notification email
        await sendScanNotification({
          to: user.email,
          petName: pet.name,
          location: latitude && longitude ? { lat: latitude, lng: longitude } : null,
          isLost: pet.is_lost,
        })
      }
    }

    return NextResponse.json({ success: true, scan })
  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendScanNotification(params: {
  to: string
  petName: string
  location: { lat: number; lng: number } | null
  isLost: boolean
}) {
  // For now, we'll use a simple approach - in production you'd use Resend
  // We'll create this endpoint to be ready for Resend integration
  
  const { to, petName, location, isLost } = params
  
  // Check if Resend API key is available
  if (!process.env.RESEND_API_KEY) {
    console.log('Email notification skipped (no RESEND_API_KEY):', {
      to,
      petName,
      location,
      isLost,
    })
    return
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const locationText = location
      ? `<p>Ubicacion aproximada: <a href="https://maps.google.com/?q=${location.lat},${location.lng}">Ver en mapa</a></p>`
      : '<p>Ubicacion no disponible</p>'

    const urgentText = isLost
      ? '<p style="color: red; font-weight: bold;">Tu mascota esta marcada como PERDIDA. Alguien acaba de escanear su QR.</p>'
      : ''

    await resend.emails.send({
      from: 'PetTag <notifications@pettag.app>',
      to: [to],
      subject: `${isLost ? '[URGENTE] ' : ''}El QR de ${petName} fue escaneado`,
      html: `
        <h2>El codigo QR de ${petName} fue escaneado</h2>
        ${urgentText}
        <p>Alguien ha escaneado el codigo QR de tu mascota.</p>
        ${locationText}
        <p>Fecha y hora: ${new Date().toLocaleString('es-MX')}</p>
        <p>Revisa tu dashboard para mas detalles.</p>
      `,
    })

    console.log('Notification email sent to:', to)
  } catch (error) {
    console.error('Failed to send notification email:', error)
  }
}
