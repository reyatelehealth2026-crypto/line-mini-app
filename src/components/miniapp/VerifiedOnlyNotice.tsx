type VerifiedOnlyNoticeProps = {
  title: string
  description: string
}

export function VerifiedOnlyNotice({ title, description }: VerifiedOnlyNoticeProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-soft">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-amber-800">{description}</p>
    </div>
  )
}
