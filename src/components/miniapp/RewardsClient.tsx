'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/miniapp/AppShell'
import { RewardsGrid } from '@/components/miniapp/RewardsGrid'
import { VerifiedOnlyNotice } from '@/components/miniapp/VerifiedOnlyNotice'
import { bootstrapLine } from '@/lib/line-miniapp'
import { getRewards, redeemReward } from '@/lib/rewards-api'
import { getServiceMessageNotice } from '@/lib/service-messages'

export function RewardsClient() {
  const [lineUserId, setLineUserId] = useState('')
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const serviceMessageNotice = useMemo(() => getServiceMessageNotice(), [])

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

  const rewardsQuery = useQuery({
    queryKey: ['rewards-list'],
    queryFn: () => getRewards()
  })

  const redeemMutation = useMutation({
    mutationFn: (rewardId: number) => redeemReward(lineUserId, rewardId),
    onSuccess: (data: { message?: string }) => {
      window.alert(data.message || 'แลกรางวัลสำเร็จ')
    },
    onError: (error: unknown) => {
      window.alert(error instanceof Error ? error.message : 'แลกรางวัลไม่สำเร็จ')
    }
  })

  return (
    <AppShell title="Rewards" subtitle="แลกแต้มเป็นสินค้าและสิทธิประโยชน์สำหรับสมาชิก">
      {bootstrapError ? <VerifiedOnlyNotice title="LINE bootstrap issue" description={bootstrapError} /> : null}
      <VerifiedOnlyNotice title="Service Messages phase" description={serviceMessageNotice} />

      {rewardsQuery.isLoading ? (
        <div className="rounded-[1.75rem] bg-white p-5 text-sm text-slate-500 shadow-soft">กำลังโหลดรายการรางวัล...</div>
      ) : null}

      {rewardsQuery.data?.rewards ? (
        <RewardsGrid
          rewards={rewardsQuery.data.rewards}
          disabled={!lineUserId || redeemMutation.isPending}
          onRedeem={(rewardId) => {
            if (!lineUserId) {
              window.alert('ไม่พบ LINE user ID')
              return
            }
            void redeemMutation.mutateAsync(rewardId)
          }}
        />
      ) : null}
    </AppShell>
  )
}
