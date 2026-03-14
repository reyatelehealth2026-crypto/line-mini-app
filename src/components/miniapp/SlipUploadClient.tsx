'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, CheckCircle, Loader2, Receipt } from 'lucide-react'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { uploadSlip } from '@/lib/odoo-invoices-api'

function nowLocalISO() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function SlipUploadClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [base64, setBase64] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [transferDate, setTransferDate] = useState(nowLocalISO)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ matched: boolean; orderName?: string; amount?: number } | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPreview(dataUrl)
      setBase64(dataUrl.split(',')[1] || '')
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!base64) {
      window.alert('กรุณาเลือกรูปหลักฐานการโอน')
      return
    }
    if (!amount) {
      window.alert('กรุณาระบุจำนวนเงิน')
      return
    }

    setSubmitting(true)
    try {
      const res = await uploadSlip(lineUserId, base64, amount, transferDate)
      if (res.success) {
        const d = res.data
        const isMatched = d?.matched || d?.status === 'matched'
        setResult({
          matched: isMatched ?? false,
          orderName: d?.order_name,
          amount: d?.amount
        })
      } else {
        window.alert(res.error || 'เกิดข้อผิดพลาดในการอัพโหลด')
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <AppShell title="แจ้งโอนเงิน" subtitle="ส่งหลักฐานการชำระเงิน">
        <div className="animate-slide-up flex flex-col items-center gap-4 rounded-3xl bg-white py-14 shadow-soft">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            {result.matched ? 'จับคู่เรียบร้อยแล้ว' : 'ส่งหลักฐานสำเร็จ'}
          </p>
          {result.matched && result.orderName ? (
            <p className="text-sm text-slate-500">📦 ออเดอร์: {result.orderName}</p>
          ) : (
            <p className="text-sm text-slate-500">⏳ รอเจ้าหน้าที่ตรวจสอบและจับคู่การชำระเงิน</p>
          )}
          {result.amount ? (
            <p className="text-sm font-semibold text-line">
              💰 ฿{result.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          ) : null}
          <button
            onClick={() => {
              setResult(null)
              setPreview(null)
              setBase64('')
              setAmount('')
              setTransferDate(nowLocalISO())
            }}
            className="btn-secondary mt-2 text-sm"
          >
            ส่งอีกครั้ง
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="แจ้งโอนเงิน" subtitle="ส่งหลักฐานการชำระเงิน">
      <form onSubmit={handleSubmit} className="animate-slide-up space-y-4">
        {/* Image Upload */}
        <div className="rounded-3xl bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-line-soft">
              <Receipt size={14} className="text-line" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">หลักฐานการโอนเงิน</h3>
          </div>

          <div className="p-5">
            <div
              onClick={() => fileRef.current?.click()}
              className="relative flex h-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-line hover:bg-line-soft/30"
            >
              {preview ? (
                <img src={preview} alt="Slip preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Camera size={32} />
                  <p className="text-sm font-medium">แตะเพื่ออัพโหลดรูปภาพ</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Amount & Date */}
        <div className="rounded-3xl bg-white shadow-soft">
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">จำนวนเงิน</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">วันที่โอน</label>
              <input
                type="datetime-local"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !base64}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              กำลังส่งข้อมูล...
            </>
          ) : (
            'ส่งหลักฐานการโอนเงิน'
          )}
        </button>
      </form>
    </AppShell>
  )
}
