import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <div className="rounded-[2rem] bg-white p-6 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-line">Re-Ya</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">LINE Mini App</h1>
        <p className="mt-3 text-sm text-slate-500">
          โปรเจกต์ใหม่สำหรับ Member Profile และ Rewards โดยเชื่อมกับ PHP backend เดิมของ Re-Ya
        </p>
        <div className="mt-6 grid gap-3">
          <Link href="/profile" className="rounded-2xl bg-line px-4 py-3 text-center font-medium text-white">
            เปิดหน้าโปรไฟล์สมาชิก
          </Link>
          <Link href="/rewards" className="rounded-2xl bg-slate-950 px-4 py-3 text-center font-medium text-white">
            เปิดหน้าแลกแต้ม
          </Link>
          <Link href="/rewards/history" className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-medium text-slate-700">
            ดูประวัติการแลก
          </Link>
        </div>
      </div>
    </main>
  )
}
