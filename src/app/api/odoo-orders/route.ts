import { NextRequest, NextResponse } from 'next/server'

const PHP_API_BASE = (process.env.NEXT_PUBLIC_PHP_API_BASE_URL || 'https://cny.re-ya.com').replace(/\/$/, '')
const ACCOUNT_ID = process.env.NEXT_PUBLIC_LINE_ACCOUNT_ID || '3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const lineUserId = searchParams.get('line_user_id')
    const limit = searchParams.get('limit') || '20'
    const offset = searchParams.get('offset') || '0'

    if (!lineUserId) {
      return NextResponse.json({ success: false, error: 'Missing line_user_id' }, { status: 400 })
    }

    const url = new URL(`${PHP_API_BASE}/api/odoo-dashboard-api.php`)
    url.searchParams.set('action', 'odoo_orders')
    url.searchParams.set('line_user_id', lineUserId)
    url.searchParams.set('line_account_id', ACCOUNT_ID)
    url.searchParams.set('limit', limit)
    url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      method: 'GET',
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
