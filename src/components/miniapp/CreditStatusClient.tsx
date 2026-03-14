'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw, Wallet } from 'lucide-react'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { getOdooCreditStatus } from '@/lib/odoo-invoices-api'

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-44 w-full rounded-3xl" />
      <div className="skeleton h-32 w-full rounded-3xl" />
    </div>
  )
}

export function CreditStatusClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''

  const query = useQuery({
    queryKey: ['odoo-credit-status', lineUserId],
    queryFn: () => getOdooCreditStatus(lineUserId),
    enabled: Boolean(lineUserId),
    retry: 1
  })

  const data = query.data?.success ? query.data.data : null

  const creditLimit = data?.credit_limit ?? 0
  const creditUsed = data?.credit_used ?? 0
  const creditAvailable = creditLimit - creditUsed
  const overdueAmount = data?.overdue_amount ?? 0
  const usagePct = creditLimit > 0 ? Math.min((creditUsed / creditLimit) * 100, 100) : 0
  const barColor = usagePct >= 90 ? '#ef4444' : usagePct >= 75 ? '#f59e0b' : '#06d6a0'

  return (
    <AppShell title="สถานะวงเงินเครดิต" subtitle="ดูยอดวงเงินและสถานะการชำระเงิน">
      {query.isLoading ? <LoadingSkeleton /> : null}

      {query.isError || (query.data && !query.data.success) ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white py-14 shadow-soft">
          <AlertTriangle size={32} className="text-slate-300" />
          <p className="text-sm text-slate-500">{query.data?.error || 'ไม่สามารถโหลดข้อมูลได้'}</p>
          <button
            onClick={() => query.refetch()}
            className="btn-primary mt-2 inline-flex text-sm"
          >
            <RefreshCw size={16} /> ลองใหม่
          </button>
        </div>
      ) : null}

      {data ? (
        <div className="space-y-4">
          {/* Main Credit Card */}
          <div className="animate-slide-up rounded-3xl bg-white shadow-soft">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-line-soft">
                <Wallet size={14} className="text-line" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">วงเงินเครดิต</h3>
            </div>

            <div className="px-5 py-6">
              {/* Big Number */}
              <div className="text-center">
                <p className="text-xs font-medium text-slate-500">วงเงินทั้งหมด</p>
                <p className="mt-1 text-4xl font-extrabold tabular-nums text-line">
                  ฿{creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>ใช้ไปแล้ว</span>
                  <span className="font-semibold">{usagePct.toFixed(0)}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${usagePct}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 divide-y divide-slate-50">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">ใช้ไปแล้ว</span>
                  <span className="text-base font-bold tabular-nums text-slate-900">
                    ฿{creditUsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">คงเหลือ</span>
                  <span className="text-base font-bold tabular-nums text-line">
                    ฿{creditAvailable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {overdueAmount > 0 ? (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-500">เกินกำหนดชำระ</span>
                    <span className="text-base font-bold tabular-nums text-red-500">
                      ฿{overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {usagePct >= 90 ? (
            <div className="animate-fade-in rounded-2xl border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">⚠️ วงเงินใกล้หมด</p>
              <p className="mt-1 text-xs text-red-700">
                คุณใช้วงเงินเครดิตไปแล้ว {usagePct.toFixed(0)}% กรุณาชำระเงินเพื่อเพิ่มวงเงิน
              </p>
            </div>
          ) : usagePct >= 75 ? (
            <div className="animate-fade-in rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">⚠️ วงเงินใกล้เต็ม</p>
              <p className="mt-1 text-xs text-amber-700">
                คุณใช้วงเงินเครดิตไปแล้ว {usagePct.toFixed(0)}%
              </p>
            </div>
          ) : null}

          {overdueAmount > 0 ? (
            <div className="animate-fade-in rounded-2xl border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">⚠️ มียอดเกินกำหนดชำระ</p>
              <p className="mt-1 text-xs text-red-700">
                คุณมียอดเกินกำหนดชำระ ฿{overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} กรุณาชำระโดยเร็วที่สุด
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </AppShell>
  )
}
