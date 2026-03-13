import { BottomNav } from '@/components/miniapp/BottomNav'
import { MiniAppHeader } from '@/components/miniapp/MiniAppHeader'

type AppShellProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <MiniAppHeader title={title} subtitle={subtitle} />
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}
