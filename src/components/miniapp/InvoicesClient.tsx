'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, FileText, Inbox, RefreshCw } from 'lucide-react'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { getOdooInvoices } from '@/lib/odoo-invoices-api'
import type { OdooInvoice } from '@/types/odoo-invoices'

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton h-20 w-full rounded-3xl" />
      ))}
    </div>
  )
}

function invoiceStatusBadge(inv: OdooInvoice) {
  if (inv.state === 'posted') {
    if (inv.payment_state === 'paid') {
      return <span className="badge badge-green">ชำระแล้ว</span>
    }
    if (inv.payment_state === 'partial') {
      return <span className="badge badge-blue">ชำระบางส่วน</span>
    }
    return <span className="badge badge-amber">ค้างชำระ</span>
  }
  if (inv.state === 'cancel') {
    return <span className="badge badge-red">ยกเลิก</span>
  }
  return <span className="badge badge-slate">ฉบับร่าง</span>
}

function InvoiceCard({ invoice }: { invoice: OdooInvoice }) {
  const dateStr = invoice.date
    ? new Date(invoice.date).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '-'

  const currency = Array.isArray(invoice.currency_id) ? invoice.currency_id[1] : 'THB'

  return (
    <article className="animate-fade-in rounded-3xl bg-white shadow-soft">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
              <FileText size={18} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">{invoice.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{dateStr}</p>
            </div>
          </div>
          {invoiceStatusBadge(invoice)}
        </div>
        <div className="mt-3 border-t border-slate-50 pt-3 text-right">
          <span className="text-base font-bold tabular-nums text-slate-900">
            ฿{invoice.amount_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          {currency !== 'THB' ? (
            <span className="ml-1 text-xs text-slate-400">{currency}</span>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function InvoicesClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''

  const query = useQuery({
    queryKey: ['odoo-invoices', lineUserId],
    queryFn: () => getOdooInvoices(lineUserId, 30),
    enabled: Boolean(lineUserId),
    retry: 1
  })

  // Handle wrapped response
  const rawData = query.data?.data
  const invoices: OdooInvoice[] = Array.isArray(rawData)
    ? rawData
    : (rawData && 'invoices' in rawData ? rawData.invoices : [])

  return (
    <AppShell title="ใบแจ้งหนี้ Odoo" subtitle="รายการใบแจ้งหนี้และสถานะการชำระเงิน">
      {query.isLoading ? <LoadingSkeleton /> : null}

      {query.isError || (query.data && !query.data.success) ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white py-14 shadow-soft">
          <AlertTriangle size={32} className="text-slate-300" />
          <p className="text-sm text-slate-500">{query.data?.error || 'ไม่สามารถโหลดข้อมูลได้'}</p>
          <button onClick={() => query.refetch()} className="btn-primary mt-2 inline-flex text-sm">
            <RefreshCw size={16} /> ลองใหม่
          </button>
        </div>
      ) : null}

      {!query.isLoading && query.data?.success && invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white py-16 shadow-soft">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Inbox size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">ไม่พบใบแจ้งหนี้</p>
        </div>
      ) : null}

      {invoices.length > 0 ? (
        <div className="space-y-3">
          {invoices.map((inv, i) => (
            <div key={inv.id || i} style={{ animationDelay: `${i * 50}ms` }}>
              <InvoiceCard invoice={inv} />
            </div>
          ))}
        </div>
      ) : null}
    </AppShell>
  )
}
