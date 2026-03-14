import { appConfig } from '@/lib/config'
import type { OdooOrdersResponse } from '@/types/orders'

export async function getMyOrders(lineUserId: string, limit = 20, offset = 0): Promise<OdooOrdersResponse> {
  const params = new URLSearchParams({
    line_user_id: lineUserId,
    limit: String(limit),
    offset: String(offset)
  })
  const res = await fetch(`/api/odoo-orders?${params}`, { cache: 'no-store' })
  return res.json() as Promise<OdooOrdersResponse>
}

export function getOrderTrackingUrl(orderId: number | string) {
  return `${appConfig.apiBaseUrl}/liff/odoo-order-tracking.php?id=${orderId}&account=${appConfig.lineAccountId}`
}

export function getOrderDetailUrl(orderId: number | string) {
  return `${appConfig.apiBaseUrl}/liff/odoo-order-detail.php?id=${orderId}&account=${appConfig.lineAccountId}`
}
