import { phpPost } from '@/lib/php-bridge'
import { appConfig } from '@/lib/config'
import type { OdooProfileResponse } from '@/types/odoo-profile'

export async function getOdooProfile(lineUserId: string) {
  return phpPost<OdooProfileResponse>('/liff/odoo-user-link.php', {
    action: 'profile',
    line_user_id: lineUserId
  })
}

export function getOdooLinkUrl() {
  return `${appConfig.apiBaseUrl}/liff/odoo-link.php?account=${appConfig.lineAccountId}`
}
