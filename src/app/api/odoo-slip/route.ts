import { NextRequest, NextResponse } from 'next/server'

const PHP_API_BASE = (process.env.NEXT_PUBLIC_PHP_API_BASE_URL || 'https://cny.re-ya.com').replace(/\/$/, '')
const ACCOUNT_ID = process.env.NEXT_PUBLIC_LINE_ACCOUNT_ID || '3'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lineUserId = body.line_user_id

    if (!lineUserId) {
      return NextResponse.json({ success: false, error: 'Missing line_user_id' }, { status: 400 })
    }

    if (!body.image_base64) {
      return NextResponse.json({ success: false, error: 'Missing image_base64' }, { status: 400 })
    }

    const response = await fetch(`${PHP_API_BASE}/api/odoo-slip-upload.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line_user_id: lineUserId,
        line_account_id: ACCOUNT_ID,
        image_base64: body.image_base64,
        amount: body.amount,
        transfer_date: body.transfer_date
      }),
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
