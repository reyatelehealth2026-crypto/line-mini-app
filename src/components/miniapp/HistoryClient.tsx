'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/miniapp/AppShell'
import { RedemptionHistoryList } from '@/components/miniapp/RedemptionHistoryList'
import { VerifiedOnlyNotice } from '@/components/miniapp/VerifiedOnlyNotice'
import { bootstrapLine } from '@/lib/line-miniapp'
import { getMyRedemptions } from '@/lib/rewards-api'

export function HistoryClient() {
  const [lineUserId, setLineUserId] = useState('')
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)

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

  const historyQuery = useQuery({
    queryKey: ['reward-history', lineUserId],
    queryFn: () => getMyRedemptions(lineUserId),
    enabled: Boolean(lineUserId)
  })

  return (
    <AppShell title="Redemption History" subtitle="ติดตามสถานะการแลกรางวัลของสมาชิก">
      {bootstrapError ? <VerifiedOnlyNotice title="LINE bootstrap issue" description={bootstrapError} /> : null}

      {historyQuery.isLoading ? (
        <div className="rounded-[1.75rem] bg-white p-5 text-sm text-slate-500 shadow-soft">กำลังโหลดประวัติการแลก...</div>
      ) : null}

      <RedemptionHistoryList items={historyQuery.data?.redemptions || []} />
    </AppShell>
  )
}
