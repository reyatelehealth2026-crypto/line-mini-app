import type { RewardItem } from '@/types/rewards'
import { RewardCard } from '@/components/miniapp/RewardCard'

export function RewardsGrid({ rewards, onRedeem, disabled }: { rewards: RewardItem[]; onRedeem: (rewardId: number) => void; disabled?: boolean }) {
  return (
    <div className="grid gap-4">
      {rewards.map((reward) => (
        <RewardCard key={reward.id} reward={reward} onRedeem={onRedeem} disabled={disabled} />
      ))}
    </div>
  )
}
