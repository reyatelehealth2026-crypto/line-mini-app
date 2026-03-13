'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/miniapp/AppShell'
import { MemberCard } from '@/components/miniapp/MemberCard'
import { ProfileForm } from '@/components/miniapp/ProfileForm'
import { VerifiedOnlyNotice } from '@/components/miniapp/VerifiedOnlyNotice'
import { bootstrapLine, getMiniAppCapabilities } from '@/lib/line-miniapp'
import { checkMember, getMemberCard, updateMemberProfile } from '@/lib/member-api'
import { getQuickFillUnavailableReason } from '@/lib/common-profile'
import type { MemberUpdatePayload } from '@/types/member'

export function ProfileClient() {
  const [lineUserId, setLineUserId] = useState('')
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const capabilities = useMemo(() => getMiniAppCapabilities(), [])

  useEffect(() => {
    void (async () => {
      const state = await bootstrapLine()
      if (state.profile?.userId) {
        setLineUserId(state.profile.userId)
      }
      if (state.error) {
        setBootstrapError(state.error)
      }
    })()
  }, [])

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

  const updateProfileMutation = useMutation({
    mutationFn: (payload: MemberUpdatePayload) => updateMemberProfile(payload),
    onSuccess: () => {
      void memberQuery.refetch()
      window.alert('บันทึกข้อมูลสมาชิกสำเร็จ')
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : 'บันทึกข้อมูลไม่สำเร็จ')
    }
  })

  return (
    <AppShell title="Member Profile" subtitle="จัดการข้อมูลสมาชิกและดูสถานะแต้มสะสม">
      {bootstrapError ? <VerifiedOnlyNotice title="LINE bootstrap issue" description={bootstrapError} /> : null}

      {!capabilities.canUseQuickFill ? (
        <VerifiedOnlyNotice title="Quick-fill ยังไม่เปิดใช้" description={getQuickFillUnavailableReason()} />
      ) : null}

      {!lineUserId || memberQuery.isLoading ? (
        <div className="rounded-[1.75rem] bg-white p-5 text-sm text-slate-500 shadow-soft">กำลังโหลดข้อมูลสมาชิก...</div>
      ) : null}

      {memberQuery.data?.member && memberQuery.data?.tier ? (
        <>
          <MemberCard member={memberQuery.data.member} tier={memberQuery.data.tier} />
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
