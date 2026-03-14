import { NextRequest, NextResponse } from 'next/server'

const PHP_API_BASE = (process.env.NEXT_PUBLIC_PHP_API_BASE_URL || 'https://cny.re-ya.com').replace(/\/$/, '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lineUserId = body.line_user_id

    if (!lineUserId) {
      return NextResponse.json({ success: false, error: 'Missing line_user_id' }, { status: 400 })
    }

    const response = await fetch(`${PHP_API_BASE}/liff/odoo-user-link.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'profile', line_user_id: lineUserId }),
      cache: 'no-store'
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Proxy error' },
      { status: 500 }
    )
  }
}
