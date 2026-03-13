'use client'

import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react'
import type { MemberProfile, MemberUpdatePayload } from '@/types/member'

type ProfileFormState = {
  first_name: string
  last_name: string
  phone: string
  email: string
  birthday: string
  gender: string
  address: string
  district: string
  province: string
  postal_code: string
}

type ProfileFormProps = {
  member: MemberProfile
  lineUserId: string
  onSubmit: (payload: MemberUpdatePayload) => Promise<void>
  onQuickFill?: () => Promise<void>
  quickFillDisabled?: boolean
}

export function ProfileForm({ member, lineUserId, onSubmit, onQuickFill, quickFillDisabled }: ProfileFormProps) {
  const initialState = useMemo<ProfileFormState>(
    () => ({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      phone: member.phone || '',
      email: member.email || '',
      birthday: member.birthday || '',
      gender: member.gender || '',
      address: member.address || '',
      district: member.district || '',
      province: member.province || '',
      postal_code: member.postal_code || ''
    }),
    [member]
  )

  const [form, setForm] = useState(initialState)
  const [saving, setSaving] = useState(false)

  function setField(field: keyof ProfileFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value
      setForm((prev: ProfileFormState) => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ line_user_id: lineUserId, ...form })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.75rem] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">ข้อมูลสมาชิก</h3>
        {onQuickFill ? (
          <button
            type="button"
            onClick={() => void onQuickFill()}
            disabled={quickFillDisabled}
            className="rounded-full border border-line/30 px-3 py-1 text-xs font-medium text-line disabled:cursor-not-allowed disabled:opacity-50"
          >
            Auto-fill
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={form.first_name} onChange={setField('first_name')} placeholder="ชื่อ" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line" />
        <input value={form.last_name} onChange={setField('last_name')} placeholder="นามสกุล" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line" />
        <input value={form.phone} onChange={setField('phone')} placeholder="เบอร์โทร" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line" />
        <input value={form.email} onChange={setField('email')} placeholder="อีเมล" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line" />
        <input type="date" value={form.birthday} onChange={setField('birthday')} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line" />
        <select value={form.gender} onChange={setField('gender')} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line">
          <option value="">เลือกเพศ</option>
          <option value="male">ชาย</option>
          <option value="female">หญิง</option>
          <option value="other">อื่น ๆ</option>
        </select>
        <input value={form.address} onChange={setField('address')} placeholder="ที่อยู่" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line sm:col-span-2" />
        <input value={form.district} onChange={setField('district')} placeholder="อำเภอ/เขต" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line" />
        <input value={form.province} onChange={setField('province')} placeholder="จังหวัด" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line" />
        <input value={form.postal_code} onChange={setField('postal_code')} placeholder="รหัสไปรษณีย์" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-line sm:col-span-2" />
      </div>

      <button type="submit" disabled={saving} className="mt-4 w-full rounded-2xl bg-line px-4 py-3 font-medium text-white disabled:opacity-60">
        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสมาชิก'}
      </button>
    </form>
  )
}
