'use client'

import { useQuery } from '@tanstack/react-query'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { MemberCard } from '@/components/miniapp/MemberCard'
import { MiniAppPerksCard } from '@/components/miniapp/MiniAppPerksCard'
import { OdooAccountCard, OdooAccountNotLinked } from '@/components/miniapp/OdooAccountCard'
import { OrderCenterCard } from '@/components/miniapp/OrderCenterCard'
import { VerifiedOnlyNotice } from '@/components/miniapp/VerifiedOnlyNotice'
import { checkMember, getMemberCard } from '@/lib/member-api'
import { getOdooProfile } from '@/lib/odoo-profile-api'

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-48 w-full" />
      <div className="skeleton h-64 w-full" />
    </div>
  )
}

export function ProfileClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''

  useQuery({
    queryKey: ['member-check', lineUserId],
    queryFn: () => checkMember(lineUserId),
    enabled: Boolean(lineUserId)
  })

  const memberQuery = useQuery({
    queryKey: ['member-card', lineUserId],
    queryFn: () => getMemberCard(lineUserId),
    enabled: Boolean(lineUserId)
  })

  const odooProfileQuery = useQuery({
    queryKey: ['odoo-profile', lineUserId],
    queryFn: () => getOdooProfile(lineUserId),
    enabled: Boolean(lineUserId),
    retry: false
  })
  const isOdooLinked = Boolean(odooProfileQuery.data?.success && odooProfileQuery.data.data)
  const linkedOdooProfile = isOdooLinked ? odooProfileQuery.data?.data ?? null : null

  return (
    <AppShell title="โปรไฟล์สมาชิก" subtitle="ดูข้อมูลสมาชิกและศูนย์การสั่งซื้อ">
      {line.error ? <VerifiedOnlyNotice title="LINE bootstrap issue" description={line.error} /> : null}

      {!lineUserId || memberQuery.isLoading ? <LoadingSkeleton /> : null}

      {memberQuery.data?.member && memberQuery.data?.tier ? (
        <>
          <MemberCard member={memberQuery.data.member} tier={memberQuery.data.tier} />
          <MiniAppPerksCard member={memberQuery.data.member} tier={memberQuery.data.tier} />

          {/* Odoo Account Section */}
          {linkedOdooProfile ? (
            <OdooAccountCard profile={linkedOdooProfile} />
          ) : !odooProfileQuery.isLoading ? (
            <OdooAccountNotLinked />
          ) : (
            <div className="skeleton h-48 w-full rounded-3xl" />
          )}

          {!odooProfileQuery.isLoading ? (
            <OrderCenterCard lineUserId={lineUserId} isLinked={isOdooLinked} />
          ) : (
            <div className="skeleton h-64 w-full rounded-3xl" />
          )}
        </>
      ) : null}
    </AppShell>
  )
}
