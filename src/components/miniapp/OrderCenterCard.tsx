'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronRight, FileText, Package, Receipt, Wallet } from 'lucide-react'
import { getOdooCreditStatus, getOdooInvoices } from '@/lib/odoo-invoices-api'
import { getMyOrders } from '@/lib/orders-api'
import type { OdooInvoice } from '@/types/odoo-invoices'
import type { OdooOrder } from '@/types/orders'

type OrderCenterCardProps = {
  lineUserId: string
  isLinked: boolean
}

function formatCurrency(value: number) {
  return `฿${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

function ActionTile({ href, icon: Icon, title, description }: { href: string; icon: typeof Package; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon size={17} className="text-line" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <ChevronRight size={14} className="text-slate-300" />
      </div>
    </Link>
  )
}

function SummaryTile({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const colorClass = tone === 'success'
    ? 'text-emerald-600'
    : tone === 'warning'
      ? 'text-amber-600'
      : tone === 'danger'
        ? 'text-red-500'
        : 'text-slate-900'

  return (
    <div className="rounded-2xl bg-slate-50 p-3.5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}

function toInvoices(data: { data?: OdooInvoice[] | { invoices: OdooInvoice[] } } | undefined) {
  const raw = data?.data
  if (Array.isArray(raw)) {
    return raw
  }
  if (raw && 'invoices' in raw) {
    return raw.invoices
  }
  return []
}

function latestOrderLabel(order: OdooOrder | undefined) {
  if (!order) {
    return 'ยังไม่มีออเดอร์'
  }
  if (order.is_delivered) {
    return 'จัดส่งแล้ว'
  }
  if (order.is_paid) {
    return 'ชำระแล้ว'
  }
  switch (order.state) {
    case 'sale':
    case 'done':
      return 'ยืนยันแล้ว'
    case 'draft':
    case 'sent':
      return 'รอดำเนินการ'
    case 'cancel':
      return 'ยกเลิก'
    default:
      return order.state_display || order.state || 'ไม่ทราบสถานะ'
  }
}

export function OrderCenterCard({ lineUserId, isLinked }: OrderCenterCardProps) {
  const ordersQuery = useQuery({
    queryKey: ['profile-order-center-orders', lineUserId],
    queryFn: () => getMyOrders(lineUserId, 3),
    enabled: Boolean(lineUserId) && isLinked,
    retry: 1
  })

  const invoicesQuery = useQuery({
    queryKey: ['profile-order-center-invoices', lineUserId],
    queryFn: () => getOdooInvoices(lineUserId, 5),
    enabled: Boolean(lineUserId) && isLinked,
    retry: 1
  })

  const creditQuery = useQuery({
    queryKey: ['profile-order-center-credit', lineUserId],
    queryFn: () => getOdooCreditStatus(lineUserId),
    enabled: Boolean(lineUserId) && isLinked,
    retry: 1
  })

  if (!isLinked) {
    return (
      <section className="animate-slide-up rounded-3xl bg-white shadow-soft">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">ศูนย์การสั่งซื้อ</h3>
          <p className="mt-1 text-xs text-slate-500">ดูออเดอร์ ใบแจ้งหนี้ เครดิต และแจ้งโอนในที่เดียว</p>
        </div>
        <div className="px-5 py-5">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">เชื่อมต่อบัญชี Odoo ก่อนใช้งาน</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              เมื่อเชื่อมต่อแล้ว คุณจะดูออเดอร์ล่าสุด ใบแจ้งหนี้ สถานะเครดิต และแจ้งโอนเงินได้จากหน้านี้ทันที
            </p>
          </div>
        </div>
      </section>
    )
  }

  const orders = ordersQuery.data?.orders || []
  const latestOrder = orders[0]
  const invoices = toInvoices(invoicesQuery.data)
  const unpaidInvoices = invoices.filter((invoice) => invoice.state === 'posted' && invoice.payment_state !== 'paid')
  const credit = creditQuery.data?.success ? creditQuery.data.data : null
  const creditAvailable = Math.max((credit?.credit_limit ?? 0) - (credit?.credit_used ?? 0), 0)
  const overdueAmount = credit?.overdue_amount ?? 0
  const isLoading = ordersQuery.isLoading || invoicesQuery.isLoading || creditQuery.isLoading
  const hasOrderSnapshot = latestOrder || ordersQuery.data?.total
  const latestOrderDate = latestOrder?.date_order
    ? new Date(latestOrder.date_order).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  let stripTone = 'emerald'
  let stripTitle = 'บัญชีพร้อมใช้งาน'
  let stripDescription = 'ติดตามออเดอร์ ใบแจ้งหนี้ และการแจ้งโอนได้จากปุ่มลัดด้านล่าง'

  if (overdueAmount > 0) {
    stripTone = 'red'
    stripTitle = 'มียอดเกินกำหนดชำระ'
    stripDescription = `กรุณาตรวจสอบยอด ${formatCurrency(overdueAmount)} เพื่อให้วงเงินกลับมาใช้งานได้เต็มที่`
  } else if (unpaidInvoices.length > 0) {
    stripTone = 'amber'
    stripTitle = 'มีใบแจ้งหนี้รอตรวจสอบ'
    stripDescription = `ขณะนี้มี ${unpaidInvoices.length} ใบแจ้งหนี้ที่ยังไม่ชำระหรือชำระไม่ครบ`
  } else if (!hasOrderSnapshot && !isLoading) {
    stripTone = 'slate'
    stripTitle = 'ยังไม่มีประวัติการสั่งซื้อ'
    stripDescription = 'เมื่อมีข้อมูลจาก Odoo ระบบจะแสดงสถานะและทางลัดให้ที่นี่'
  }

  const stripClass = stripTone === 'red'
    ? 'border-red-200 bg-red-50 text-red-800'
    : stripTone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : stripTone === 'slate'
        ? 'border-slate-200 bg-slate-50 text-slate-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'

  return (
    <section className="animate-slide-up rounded-3xl bg-white shadow-soft">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-bold text-slate-900">ศูนย์การสั่งซื้อ</h3>
        <p className="mt-1 text-xs text-slate-500">ดูออเดอร์ล่าสุด ใบแจ้งหนี้ เครดิต และแจ้งโอนในที่เดียว</p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryTile
            label="ออเดอร์ล่าสุด"
            value={isLoading && orders.length === 0 ? 'กำลังโหลด...' : latestOrder ? latestOrderLabel(latestOrder) : `${ordersQuery.data?.total || 0} รายการ`}
            tone={latestOrder?.is_delivered ? 'success' : latestOrder?.state === 'cancel' ? 'danger' : 'default'}
          />
          <SummaryTile
            label="ใบแจ้งหนี้ค้าง"
            value={isLoading && invoices.length === 0 ? 'กำลังโหลด...' : `${unpaidInvoices.length} รายการ`}
            tone={unpaidInvoices.length > 0 ? 'warning' : 'success'}
          />
          <SummaryTile
            label="เครดิตคงเหลือ"
            value={isLoading && !credit ? 'กำลังโหลด...' : formatCurrency(creditAvailable)}
            tone={overdueAmount > 0 ? 'danger' : creditAvailable > 0 ? 'success' : 'warning'}
          />
        </div>

        {latestOrder ? (
          <Link href="/orders" className="block rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">ออเดอร์ล่าสุด</p>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">{latestOrder.order_name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {latestOrderDate}
                  {latestOrder.amount_total != null ? ` • ${formatCurrency(latestOrder.amount_total)}` : ''}
                </p>
              </div>
              <span className="badge badge-slate shrink-0">{latestOrderLabel(latestOrder)}</span>
            </div>
          </Link>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <ActionTile href="/orders" icon={Package} title="ออเดอร์ของฉัน" description="ดูรายการล่าสุดและติดตามสถานะ" />
          <ActionTile href="/invoices" icon={FileText} title="ใบแจ้งหนี้" description="ตรวจสอบยอดค้างและสถานะการชำระ" />
          <ActionTile href="/slip" icon={Receipt} title="แจ้งโอนเงิน" description="ส่งสลิปเพื่อให้ทีมงานตรวจสอบ" />
          <ActionTile href="/credit-status" icon={Wallet} title="สถานะเครดิต" description="ดูวงเงินคงเหลือและยอดเกินกำหนด" />
        </div>

        <div className={`rounded-2xl border p-4 ${stripClass}`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/60">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold">{stripTitle}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{stripDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
