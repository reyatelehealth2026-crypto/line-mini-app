import type { RewardItem } from '@/types/rewards'

type RewardCardProps = {
  reward: RewardItem
  disabled?: boolean
  onRedeem: (rewardId: number) => void
}

export function RewardCard({ reward, disabled, onRedeem }: RewardCardProps) {
  const stockLabel =
    reward.stock === null || reward.stock === undefined || reward.stock < 0
      ? 'ไม่จำกัด'
      : reward.stock === 0
        ? 'หมด'
        : `${reward.stock} ชิ้น`

  return (
    <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-soft">
      <div className="aspect-[4/3] bg-slate-100">
        <img
          src={reward.image_url || 'https://placehold.co/600x450?text=Reward'}
          alt={reward.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{reward.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{reward.description || 'ของรางวัลสำหรับสมาชิก'}</p>
          </div>
          <span className="rounded-full bg-line-soft px-3 py-1 text-xs font-semibold text-line">
            {reward.points_required.toLocaleString()} แต้ม
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>ประเภท: {reward.reward_type || 'reward'}</span>
          <span>คงเหลือ: {stockLabel}</span>
        </div>
        <button
          type="button"
          disabled={disabled || reward.stock === 0}
          onClick={() => onRedeem(reward.id)}
          className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          แลกของรางวัล
        </button>
      </div>
    </article>
  )
}
