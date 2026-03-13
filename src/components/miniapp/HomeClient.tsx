'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Gift, Package, Star, UserRound } from 'lucide-react'
import { useLineContext } from '@/components/providers'
import { BottomNav } from '@/components/miniapp/BottomNav'
import { getMemberCard } from '@/lib/member-api'
import { getMyOrders } from '@/lib/orders-api'

function QuickAction({ href, icon: Icon, label, description, color }: {
  href: string
  icon: typeof Gift
  label: string
  description: string
  color: string
}) {
  return (
    <Link href={href} className="group flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-soft transition-shadow hover:shadow-card">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export function HomeClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''
  const displayName = line.profile?.displayName || 'LINE User'
  const avatar = line.profile?.pictureUrl

  const memberQuery = useQuery({
    queryKey: ['member-card', lineUserId],
    queryFn: () => getMemberCard(lineUserId),
    enabled: Boolean(lineUserId)
  })

  const ordersQuery = useQuery({
    queryKey: ['my-orders-summary', lineUserId],
    queryFn: () => getMyOrders(lineUserId, 3),
    enabled: Boolean(lineUserId)
  })

  const member = memberQuery.data?.member
  const tier = memberQuery.data?.tier
  const recentOrders = ordersQuery.data?.orders || []

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-secondary">
      {/* Hero Header */}
      <header className="gradient-card safe-top px-5 pb-8 pt-5">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img src={avatar} alt="" className="h-12 w-12 rounded-full border-2 border-white/30 object-cover shadow-lg" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-lg font-bold text-white">
                  {displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm text-white/70">สวัสดี</p>
                <p className="text-lg font-bold text-white">{displayName}</p>
              </div>
            </div>
          </div>

          {/* Points Summary Card */}
          {member && tier ? (
            <div className="mt-5 rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/60">แต้มสะสม</p>
                  <p className="mt-0.5 text-3xl font-extrabold tabular-nums text-white">{member.points.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                    <Star size={12} />
                    {tier.tier_name}
                  </div>
                  <p className="mt-1 text-xs text-white/50">{member.total_orders} ออเดอร์</p>
                </div>
              </div>
            </div>
          ) : memberQuery.isLoading ? (
            <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/10" />
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto -mt-3 flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-28">
        {/* Quick Actions */}
        <section>
          <p className="section-title mb-3">เมนูหลัก</p>
          <div className="grid gap-2.5">
            <QuickAction
              href="/profile"
              icon={UserRound}
              label="โปรไฟล์สมาชิก"
              description="ดูและแก้ไขข้อมูลส่วนตัว"
              color="bg-blue-50 text-blue-600"
            />
            <QuickAction
              href="/rewards"
              icon={Gift}
              label="แลกของรางวัล"
              description="ใช้แต้มแลกสิทธิประโยชน์"
              color="bg-line-soft text-line"
            />
            <QuickAction
              href="/orders"
              icon={Package}
              label="ออเดอร์ของฉัน"
              description="ติดตามสถานะคำสั่งซื้อจาก Odoo"
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </section>

        {/* Recent Orders */}
        {recentOrders.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="section-title">ออเดอร์ล่าสุด</p>
              <Link href="/orders" className="text-xs font-semibold text-line">ดูทั้งหมด</Link>
            </div>
            <div className="space-y-2.5">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/orders"
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft transition-shadow hover:shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{order.order_name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {order.date_order ? new Date(order.date_order).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : ''}
                      {order.amount_total != null ? ` — ฿${order.amount_total.toLocaleString()}` : ''}
                    </p>
                  </div>
                  <OrderStateBadge state={order.state} isPaid={order.is_paid} isDelivered={order.is_delivered} />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <BottomNav />
    </div>
  )
}

function OrderStateBadge({ state, isPaid, isDelivered }: { state: string | null; isPaid: boolean; isDelivered: boolean }) {
  if (isDelivered) return <span className="badge badge-green">จัดส่งแล้ว</span>
  if (isPaid) return <span className="badge badge-blue">ชำระแล้ว</span>
  switch (state) {
    case 'sale':
    case 'done':
      return <span className="badge badge-green">ยืนยันแล้ว</span>
    case 'draft':
    case 'sent':
      return <span className="badge badge-amber">รอดำเนินการ</span>
    case 'cancel':
      return <span className="badge badge-red">ยกเลิก</span>
    default:
      return <span className="badge badge-slate">{state || 'ไม่ทราบ'}</span>
  }
}
