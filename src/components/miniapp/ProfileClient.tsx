'use client'

import { useMemo } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { MemberCard } from '@/components/miniapp/MemberCard'
import { OdooAccountCard, OdooAccountNotLinked } from '@/components/miniapp/OdooAccountCard'
import { ProfileForm } from '@/components/miniapp/ProfileForm'
import { VerifiedOnlyNotice } from '@/components/miniapp/VerifiedOnlyNotice'
import { getMiniAppCapabilities } from '@/lib/line-miniapp'
import { checkMember, getMemberCard, updateMemberProfile } from '@/lib/member-api'
import { getOdooProfile } from '@/lib/odoo-profile-api'
import { getQuickFillUnavailableReason } from '@/lib/common-profile'
import type { MemberUpdatePayload } from '@/types/member'

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
  const capabilities = useMemo(() => getMiniAppCapabilities(), [])

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

  const updateProfileMutation = useMutation({
    mutationFn: (payload: MemberUpdatePayload) => updateMemberProfile(payload),
    onSuccess: () => {
      void memberQuery.refetch()
      window.alert('บันทึกข้อมูลสมาชิกสำเร็จ')
    },
    onError: (error: unknown) => {
      window.alert(error instanceof Error ? error.message : 'บันทึกข้อมูลไม่สำเร็จ')
    }
  })

  return (
    <AppShell title="โปรไฟล์สมาชิก" subtitle="จัดการข้อมูลสมาชิกและดูสถานะแต้มสะสม">
      {line.error ? <VerifiedOnlyNotice title="LINE bootstrap issue" description={line.error} /> : null}

      {!capabilities.canUseQuickFill ? (
        <VerifiedOnlyNotice title="Quick-fill ยังไม่เปิดใช้" description={getQuickFillUnavailableReason()} />
      ) : null}

      {!lineUserId || memberQuery.isLoading ? <LoadingSkeleton /> : null}

      {memberQuery.data?.member && memberQuery.data?.tier ? (
        <>
          <MemberCard member={memberQuery.data.member} tier={memberQuery.data.tier} />

          {/* Odoo Account Section */}
          {odooProfileQuery.data?.success && odooProfileQuery.data.data ? (
            <OdooAccountCard profile={odooProfileQuery.data.data} />
          ) : !odooProfileQuery.isLoading ? (
            <OdooAccountNotLinked />
          ) : (
            <div className="skeleton h-48 w-full rounded-3xl" />
          )}

          <ProfileForm
            member={memberQuery.data.member}
            lineUserId={lineUserId}
            onSubmit={async (payload) => {
              await updateProfileMutation.mutateAsync(payload)
            }}
          />
        </>
      ) : null}
    </AppShell>
  )
}
