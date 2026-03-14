'use client'

import { useLineContext } from '@/components/providers'

type MiniAppHeaderProps = {
  title: string
  subtitle?: string
  showAvatar?: boolean
}

export function MiniAppHeader({ title, subtitle, showAvatar = true }: MiniAppHeaderProps) {
  const line = useLineContext()
  const avatar = line.profile?.pictureUrl
  const name = line.profile?.displayName

  return (
    <header className="shrink-0 safe-top gradient-card px-5 pb-7 text-white">
      <div className="mx-auto max-w-md">
        {showAvatar && (avatar || name) ? (
          <div className="mb-4 flex items-center gap-3">
            {avatar ? (
              <img src={avatar} alt="" className="h-9 w-9 rounded-full border-2 border-white/30 object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-sm font-bold">
                {name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-white/90">{name || 'LINE User'}</span>
          </div>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm leading-relaxed text-white/75">{subtitle}</p> : null}
      </div>
    </header>
  )
}
