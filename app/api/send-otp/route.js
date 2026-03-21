import { NextResponse } from 'next/server'

global.otpStorage = global.otpStorage || {}

const OTP_TTL_MS = 5 * 60 * 1000

function normalizePhone(rawPhone = '') {
  const digits = String(rawPhone).replace(/\D/g, '')
  if (/^0\d{9}$/.test(digits)) return `94${digits.slice(1)}`
  if (/^94\d{9}$/.test(digits)) return digits
  return null
}

export async function POST(request) {
  try {
    const { phone } = await request.json()
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid Sri Lankan mobile number' },
        { status: 400 }
      )
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    global.otpStorage[normalizedPhone] = {
      otp: otpCode,
      expiresAt: Date.now() + OTP_TTL_MS,
    }

    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`

    const helloPayload = {
      messaging_product: 'whatsapp',
      to: normalizedPhone,
      type: 'template',
      template: { name: 'hello_world', language: { code: 'en_US' } },
    }

    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(helloPayload),
    })

    const textPayload = {
      messaging_product: 'whatsapp',
      to: normalizedPhone,
      type: 'text',
      text: {
        body: `Chem Hub Lab Access\n\nYour Secret Formula (OTP) is: ${otpCode}\nDo not share this code with anyone.`,
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(textPayload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: 'WhatsApp error', details: errorData },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'OTP sent', phone: normalizedPhone })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while sending OTP' },
      { status: 500 }
    )
  }
}