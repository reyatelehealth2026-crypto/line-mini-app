import { appConfig } from '@/lib/config'
import type { OdooProfileResponse } from '@/types/odoo-profile'

export async function getOdooProfile(lineUserId: string): Promise<OdooProfileResponse> {
  const res = await fetch('/api/odoo-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ line_user_id: lineUserId })
  })
  return res.json() as Promise<OdooProfileResponse>
}

export function getOdooLinkUrl() {
  return `${appConfig.apiBaseUrl}/liff/odoo-link.php?account=${appConfig.lineAccountId}`
}
