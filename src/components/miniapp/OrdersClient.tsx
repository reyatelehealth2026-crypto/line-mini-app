'use client'

import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Inbox, Package, Truck } from 'lucide-react'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { VerifiedOnlyNotice } from '@/components/miniapp/VerifiedOnlyNotice'
import { getMyOrders, getOrderTrackingUrl } from '@/lib/orders-api'
import type { OdooOrder } from '@/types/orders'

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton h-28 w-full rounded-3xl" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white py-16 shadow-soft">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Inbox size={28} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">ยังไม่มีออเดอร์</p>
      <p className="text-xs text-slate-400">ออเดอร์จาก Odoo ERP จะแสดงที่นี่</p>
    </div>
  )
}

function orderStateBadge(order: OdooOrder) {
  if (order.is_delivered) return <span className="badge badge-green">จัดส่งแล้ว</span>
  if (order.is_paid) return <span className="badge badge-blue">ชำระแล้ว</span>
  switch (order.state) {
    case 'sale':
    case 'done':
      return <span className="badge badge-green">ยืนยันแล้ว</span>
    case 'draft':
    case 'sent':
      return <span className="badge badge-amber">รอดำเนินการ</span>
    case 'cancel':
      return <span className="badge badge-red">ยกเลิก</span>
    default:
      return <span className="badge badge-slate">{order.state_display || order.state || 'ไม่ทราบ'}</span>
  }
}

function OrderCard({ order }: { order: OdooOrder }) {
  const trackingUrl = getOrderTrackingUrl(order.order_id)

  return (
    <article className="animate-fade-in rounded-3xl bg-white shadow-soft">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50">
              <Package size={18} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">{order.order_name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {order.date_order
                  ? new Date(order.date_order).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'ไม่ระบุวันที่'}
              </p>
            </div>
          </div>
          {orderStateBadge(order)}
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-slate-50 pt-3 text-xs text-slate-500">
          {order.amount_total != null ? (
            <span className="font-semibold text-slate-700">
              ฿{order.amount_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          ) : null}
          {order.items_count > 0 ? (
            <span>{order.items_count} รายการ</span>
          ) : null}
          {order.delivery_status ? (
            <span className="flex items-center gap-1">
              <Truck size={12} />
              {order.delivery_status}
            </span>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-2.5">
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-line transition-colors hover:text-line-dark"
        >
          <ExternalLink size={13} />
          ดูรายละเอียดและติดตามสินค้า
        </a>
      </div>
    </article>
  )
}

export function OrdersClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''

  const ordersQuery = useQuery({
    queryKey: ['my-orders', lineUserId],
    queryFn: () => getMyOrders(lineUserId, 50),
    enabled: Boolean(lineUserId)
  })

  const orders = ordersQuery.data?.orders || []

  return (
    <AppShell title="ออเดอร์ของฉัน" subtitle="ติดตามคำสั่งซื้อทั้งหมดจาก Odoo ERP">
      {line.error ? <VerifiedOnlyNotice title="LINE bootstrap issue" description={line.error} /> : null}

      {ordersQuery.isLoading ? <LoadingSkeleton /> : null}

      {!ordersQuery.isLoading && orders.length === 0 ? <EmptyState /> : null}

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <div key={order.id} style={{ animationDelay: `${i * 60}ms` }}>
              <OrderCard order={order} />
            </div>
          ))}
          {ordersQuery.data && ordersQuery.data.total > orders.length ? (
            <p className="py-4 text-center text-xs text-slate-400">
              แสดง {orders.length} จาก {ordersQuery.data.total} ออเดอร์
            </p>
          ) : null}
        </div>
      ) : null}
    </AppShell>
  )
}
