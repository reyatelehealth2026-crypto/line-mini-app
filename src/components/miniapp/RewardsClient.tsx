'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { RewardsGrid } from '@/components/miniapp/RewardsGrid'
import { VerifiedOnlyNotice } from '@/components/miniapp/VerifiedOnlyNotice'
import { getRewards, redeemReward } from '@/lib/rewards-api'

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton h-64 w-full rounded-3xl" />
      ))}
    </div>
  )
}

export function RewardsClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''

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
    <AppShell title="แลกของรางวัล" subtitle="ใช้แต้มสะสมแลกสินค้าและสิทธิประโยชน์">
      {line.error ? <VerifiedOnlyNotice title="LINE bootstrap issue" description={line.error} /> : null}

      {rewardsQuery.isLoading ? <LoadingSkeleton /> : null}

      {rewardsQuery.data?.rewards ? (
        <RewardsGrid
          rewards={rewardsQuery.data.rewards}
          disabled={!lineUserId || redeemMutation.isPending}
          onRedeem={(rewardId) => {
            if (!lineUserId) {
              window.alert('กรุณาเข้าสู่ระบบ LINE ก่อน')
              return
            }
            void redeemMutation.mutateAsync(rewardId)
          }}
        />
      ) : null}
    </AppShell>
  )
}
