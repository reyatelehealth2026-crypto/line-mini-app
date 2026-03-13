'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState, useEffect, createContext, useContext } from 'react'
import { bootstrapLine } from '@/lib/line-miniapp'
import type { LineBootstrapState } from '@/types/line'

const LineContext = createContext<LineBootstrapState | null>(null)

export function useLineContext() {
  const context = useContext(LineContext)
  if (!context) {
    throw new Error('useLineContext must be used within LineProvider')
  }
  return context
}

function LineProvider({ children }: { children: ReactNode }) {
  const [lineState, setLineState] = useState<LineBootstrapState>({
    isReady: false,
    isLoggedIn: false,
    isInClient: false,
    profile: null,
    accessToken: null,
    error: null
  })

  useEffect(() => {
    bootstrapLine().then((state) => {
      setLineState(state)
      if (state.needsLogin) {
        import('@line/liff').then((liff) => {
          liff.default.login()
        })
      }
    })
  }, [])

  if (!lineState.isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-500">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (lineState.needsLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-500">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  if (lineState.error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-red-600">{lineState.error}</p>
        </div>
      </div>
    )
  }

  return <LineContext.Provider value={lineState}>{children}</LineContext.Provider>
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <LineProvider>{children}</LineProvider>
    </QueryClientProvider>
  )
}
