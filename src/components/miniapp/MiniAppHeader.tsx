type MiniAppHeaderProps = {
  title: string
  subtitle?: string
}

export function MiniAppHeader({ title, subtitle }: MiniAppHeaderProps) {
  return (
    <header className="safe-top rounded-b-[2rem] bg-line px-5 pb-6 pt-6 text-white shadow-soft">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">LINE Mini App</p>
      <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-white/80">{subtitle}</p> : null}
    </header>
  )
}
