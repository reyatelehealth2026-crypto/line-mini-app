'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gift, History, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/profile', label: 'โปรไฟล์', icon: UserRound },
  { href: '/rewards', label: 'แลกแต้ม', icon: Gift },
  { href: '/rewards/history', label: 'ประวัติ', icon: History }
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-3 pb-2 pt-2 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition',
                active ? 'bg-line-soft text-line' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
