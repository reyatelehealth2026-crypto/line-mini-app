import type {
  OdooInvoicesResponse,
  OdooCreditStatusResponse,
  OdooSlipUploadResponse
} from '@/types/odoo-invoices'

export async function getOdooInvoices(lineUserId: string, limit = 20): Promise<OdooInvoicesResponse> {
  const res = await fetch('/api/odoo-invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', line_user_id: lineUserId, limit })
  })
  return res.json() as Promise<OdooInvoicesResponse>
}

export async function getOdooCreditStatus(lineUserId: string): Promise<OdooCreditStatusResponse> {
  const res = await fetch('/api/odoo-invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'credit_status', line_user_id: lineUserId })
  })
  return res.json() as Promise<OdooCreditStatusResponse>
}

export async function uploadSlip(
  lineUserId: string,
  imageBase64: string,
  amount: string,
  transferDate: string
): Promise<OdooSlipUploadResponse> {
  // Send directly to PHP backend (not through Vercel proxy)
  // to avoid Vercel's 4.5MB serverless function payload limit
  const phpBase = process.env.NEXT_PUBLIC_PHP_API_BASE_URL || 'https://cny.re-ya.com'
  const res = await fetch(`${phpBase}/api/odoo-slip-upload.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      line_user_id: lineUserId,
      image_base64: imageBase64,
      amount,
      transfer_date: transferDate
    })
  })
  return res.json() as Promise<OdooSlipUploadResponse>
}
