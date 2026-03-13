import { phpGet } from '@/lib/php-bridge'
import { appConfig } from '@/lib/config'
import type { OdooOrdersResponse } from '@/types/orders'

export async function getMyOrders(lineUserId: string, limit = 20, offset = 0) {
  return phpGet<OdooOrdersResponse>('/api/odoo-dashboard-api.php', {
    action: 'odoo_orders',
    line_user_id: lineUserId,
    line_account_id: appConfig.lineAccountId,
    limit,
    offset
  })
}

export function getOrderTrackingUrl(orderId: number | string) {
  return `${appConfig.apiBaseUrl}/liff/odoo-order-tracking.php?id=${orderId}&account=${appConfig.lineAccountId}`
}

export function getOrderDetailUrl(orderId: number | string) {
  return `${appConfig.apiBaseUrl}/liff/odoo-order-detail.php?id=${orderId}&account=${appConfig.lineAccountId}`
}
