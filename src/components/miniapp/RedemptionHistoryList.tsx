import type { RedemptionItem } from '@/types/rewards'

export function RedemptionHistoryList({ items }: { items: RedemptionItem[] }) {
  if (!items.length) {
    return <div className="rounded-[1.75rem] bg-white p-5 text-sm text-slate-500 shadow-soft">ยังไม่มีประวัติการแลกรางวัล</div>
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-[1.5rem] bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{item.reward_name}</h3>
              <p className="mt-1 text-xs text-slate-500">รหัส {item.redemption_code}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{item.status}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
            <span>ใช้แต้ม {item.points_used.toLocaleString()}</span>
            <span>{new Date(item.created_at).toLocaleString('th-TH')}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
