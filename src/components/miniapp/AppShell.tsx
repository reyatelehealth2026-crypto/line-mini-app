import type { ReactNode } from 'react'
import { BottomNav } from '@/components/miniapp/BottomNav'
import { MiniAppHeader } from '@/components/miniapp/MiniAppHeader'

type AppShellProps = {
  title: string
  subtitle?: string
  showAvatar?: boolean
  children: ReactNode
}

export function AppShell({ title, subtitle, showAvatar, children }: AppShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-secondary">
      <MiniAppHeader title={title} subtitle={subtitle} showAvatar={showAvatar} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-28 pt-5">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
