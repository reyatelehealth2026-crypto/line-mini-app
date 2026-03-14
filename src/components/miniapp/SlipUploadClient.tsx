'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, CheckCircle, Loader2, QrCode, Receipt } from 'lucide-react'
import { useLineContext } from '@/components/providers'
import { AppShell } from '@/components/miniapp/AppShell'
import { uploadSlip } from '@/lib/odoo-invoices-api'
import { useToast } from '@/lib/toast'
import { useHaptic } from '@/lib/hooks'

function nowLocalISO() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.7

function compressImage(file: File): Promise<{ base64: string; previewUrl: string; sizeKB: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      const raw = dataUrl.split(',')[1] || ''
      const sizeKB = Math.round((raw.length * 3) / 4 / 1024)
      URL.revokeObjectURL(url)
      resolve({ base64: raw, previewUrl: dataUrl, sizeKB })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('ไม่สามารถอ่านรูปภาพได้'))
    }
    img.src = url
  })
}

export function SlipUploadClient() {
  const line = useLineContext()
  const lineUserId = line.profile?.userId || ''
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const haptic = useHaptic()

  const [preview, setPreview] = useState<string | null>(null)
  const [base64, setBase64] = useState<string>('')
  const [sizeKB, setSizeKB] = useState(0)
  const [amount, setAmount] = useState('')
  const [transferDate, setTransferDate] = useState(nowLocalISO)
  const [submitting, setSubmitting] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ matched: boolean; orderName?: string; amount?: number } | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCompressing(true)
    try {
      const compressed = await compressImage(file)
      setPreview(compressed.previewUrl)
      setBase64(compressed.base64)
      setSizeKB(compressed.sizeKB)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถอ่านรูปภาพได้')
    } finally {
      setCompressing(false)
    }
  }, [toast])

  const handleScanQR = useCallback(async () => {
    haptic('light')
    setScanning(true)
    try {
      const { default: liff } = await import('@line/liff')
      if (!liff.isInClient()) {
        toast.info('สแกนใช้ได้เฉพาะในแอป LINE เท่านั้น')
        return
      }
      const result = await (liff as unknown as { scanCodeV2: () => Promise<{ value: string }> }).scanCodeV2()
      if (result?.value) {
        const numericAmount = result.value.replace(/[^0-9.]/g, '')
        if (numericAmount) {
          setAmount(numericAmount)
          toast.success(`สแกนสำเร็จ: ประมาณ ฿${numericAmount}`)
        } else {
          toast.info(`ผล: ${result.value.slice(0, 30)}...`)
        }
        haptic('medium')
      }
    } catch (err) {
      if (err instanceof Error && !err.message.includes('cancel')) {
        toast.error('สแกน QR ไม่สำเร็จ')
      }
    } finally {
      setScanning(false)
    }
  }, [haptic, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!base64) {
      toast.warning('กรุณาเลือกรูปหลักฐานการโอน')
      return
    }
    if (!amount) {
      toast.warning('กรุณาระบุจำนวนเงิน')
      return
    }

    setSubmitting(true)
    haptic('medium')
    try {
      const res = await uploadSlip(lineUserId, base64, amount, transferDate)
      if (res.success) {
        const d = res.data
        const isMatched = d?.matched || d?.status === 'matched'
        haptic('heavy')
        setResult({
          matched: isMatched ?? false,
          orderName: d?.order_name,
          amount: d?.amount
        })
      } else {
        toast.error(res.error || 'เกิดข้อผิดพลาดในการอัพโหลด')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
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
              {compressing ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-sm font-medium">กำลังบีบอัดรูปภาพ...</p>
                </div>
              ) : preview ? (
                <img src={preview} alt="Slip preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Camera size={32} />
                  <p className="text-sm font-medium">แตะเพื่อเลือกรูปสลิป</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {sizeKB > 0 ? (
              <p className="mt-2 text-center text-xs text-slate-400">
                ขนาดหลังบีบอัด: {sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void handleScanQR()}
              disabled={scanning}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-line hover:bg-line-soft hover:text-line disabled:opacity-50"
            >
              {scanning ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
              {scanning ? 'กำลังสแกน...' : 'สแกน QR จากสลิป'}
            </button>
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
