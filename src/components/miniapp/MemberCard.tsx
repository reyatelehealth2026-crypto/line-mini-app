import type { MemberProfile, TierInfo } from '@/types/member'

export function MemberCard({ member, tier }: { member: MemberProfile; tier: TierInfo }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <img
          src={member.picture_url || 'https://placehold.co/96x96?text=LINE'}
          alt={member.display_name || 'member'}
          className="h-16 w-16 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Member</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-slate-900">
            {member.display_name || [member.first_name, member.last_name].filter(Boolean).join(' ') || 'LINE User'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">รหัสสมาชิก {member.member_id}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">แต้มคงเหลือ</p>
          <p className="mt-1 text-2xl font-semibold text-line">{member.points.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Tier ปัจจุบัน</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{tier.tier_name}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>ความคืบหน้าไปยังระดับถัดไป</span>
          <span>{Math.round(tier.progress_percent || 0)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-line transition-all"
            style={{ width: `${Math.min(Math.max(tier.progress_percent || 0, 0), 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          เหลืออีก {Math.max(tier.points_to_next || 0, 0).toLocaleString()} แต้ม เพื่อไปยัง {tier.next_tier_name || 'ระดับสูงสุด'}
        </p>
      </div>
    </section>
  )
}
