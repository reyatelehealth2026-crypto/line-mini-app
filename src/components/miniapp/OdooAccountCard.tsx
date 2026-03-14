'use client'

import Link from 'next/link'
import { ExternalLink, FileText, Link2, Package, Receipt, Truck, Wallet } from 'lucide-react'
import { getOdooLinkUrl } from '@/lib/odoo-profile-api'
import type { OdooCustomerProfile } from '@/types/odoo-profile'

function linkedViaLabel(linkedVia: string) {
  switch (linkedVia) {
    case 'phone': return 'เบอร์โทร'
    case 'customer_code': return 'รหัสลูกค้า'
    case 'email': return 'อีเมล'
    default: return linkedVia
  }
}

function QuickActionBtn({ icon: Icon, label, href }: {
  icon: typeof Package
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
    >
      <Icon size={22} className="text-line" />
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </Link>
  )
}

type OdooAccountCardProps = {
  profile: OdooCustomerProfile
}

export function OdooAccountCard({ profile }: OdooAccountCardProps) {
  const creditLimit = profile.credit_limit ?? 0
  const totalDue = profile.total_due ?? profile.credit_used ?? 0
  const creditRemaining = creditLimit - totalDue
  const creditPct = creditLimit > 0 ? Math.min((totalDue / creditLimit) * 100, 100) : 0
  const barColor = creditPct > 80 ? '#ef4444' : creditPct > 50 ? '#f59e0b' : '#06d6a0'

  return (
    <div className="animate-slide-up rounded-3xl bg-white shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-line-soft">
          <Link2 size={14} className="text-line" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">เชื่อมต่อบัญชี Odoo</h3>
      </div>

      {/* Profile Info */}
      <div className="divide-y divide-slate-50 px-5">
        <div className="flex items-center justify-between py-3">
          <span className="text-xs font-medium text-slate-500">ชื่อ</span>
          <span className="text-sm font-semibold text-slate-900">{profile.partner_name || '-'}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-xs font-medium text-slate-500">รหัสลูกค้า</span>
          <span className="font-mono text-sm font-semibold text-slate-900">{profile.customer_code || '-'}</span>
        </div>
        {profile.phone ? (
          <div className="flex items-center justify-between py-3">
            <span className="text-xs font-medium text-slate-500">เบอร์โทร</span>
            <span className="text-sm font-semibold text-slate-900">{profile.phone}</span>
          </div>
        ) : null}
        {profile.email ? (
          <div className="flex items-center justify-between py-3">
            <span className="text-xs font-medium text-slate-500">อีเมล</span>
            <span className="text-sm font-semibold text-slate-900">{profile.email}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between py-3">
          <span className="text-xs font-medium text-slate-500">เชื่อมต่อด้วย</span>
          <span className="text-sm font-semibold text-line">{linkedViaLabel(profile.linked_via)}</span>
        </div>
      </div>

      {/* Credit Status */}
      {creditLimit > 0 ? (
        <div className="mx-5 mb-4 mt-1 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">วงเงินเครดิต</span>
            <span className="font-bold text-slate-700">฿{creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${creditPct}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>ใช้ไป ฿{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span>คงเหลือ ฿{creditRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      ) : null}

      {/* Quick Actions Grid */}
      <div className="border-t border-slate-100 px-5 py-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <QuickActionBtn
            icon={Package}
            label="ประวัติสั่งซื้อ"
            href="/orders"
          />
          <QuickActionBtn
            icon={Truck}
            label="ติดตามพัสดุ"
            href="/orders"
          />
          <QuickActionBtn
            icon={FileText}
            label="ใบแจ้งหนี้"
            href="/invoices"
          />
          <QuickActionBtn
            icon={Receipt}
            label="แจ้งโอนเงิน"
            href="/slip"
          />
          <QuickActionBtn
            icon={Wallet}
            label="สถานะเครดิต"
            href="/credit-status"
          />
        </div>
      </div>
    </div>
  )
}

export function OdooAccountNotLinked() {
  const linkUrl = getOdooLinkUrl()

  return (
    <div className="animate-slide-up rounded-3xl bg-white shadow-soft">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
          <Link2 size={14} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">เชื่อมต่อบัญชี Odoo</h3>
      </div>
      <div className="flex flex-col items-center gap-3 px-5 py-8">
        <p className="text-center text-sm text-slate-500">
          เชื่อมต่อบัญชี Odoo เพื่อดูประวัติสั่งซื้อ ติดตามพัสดุ และจัดการใบแจ้งหนี้
        </p>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex text-sm"
        >
          <ExternalLink size={16} />
          เชื่อมต่อบัญชี Odoo
        </a>
      </div>
    </div>
  )
}
