import React, { useState } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import { useAuth } from '@/features/auth/AuthContext'
import { generateId } from '@/lib/utils'

function Field({ label, name, type = 'text', required, options, placeholder, form, errors, setForm }) {
  const err = errors[name]
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          className={`input-field ${err ? 'border-red-400 ring-red-300' : ''}`}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={`input-field ${err ? 'border-red-400 ring-red-300' : ''}`}
          placeholder={placeholder}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        />
      )}
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
    </div>
  )
}

export default function SimForm() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const isEdit = Boolean(id && id !== 'new')
  const existing = isEdit ? state.sims.find((s) => s.id === id) : null

  const [form, setForm] = useState({
    phoneNumber: existing?.phoneNumber || '',
    serialNumber: existing?.serialNumber || '',
    whatsappAccount: existing?.whatsappAccount || '',
    holder: existing?.holder || '',
    device: existing?.device || '',
    imageUrl: existing?.imageUrl || '',
    registrar: existing?.registrar || '',
    status: existing?.status || 'idle',
    note: '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.phoneNumber.trim()) e.phoneNumber = 'กรุณากรอกเบอร์โทรศัพท์'
    if (!form.holder.trim()) e.holder = 'กรุณากรอกชื่อผู้ถือครอง'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const now = new Date().toISOString()
    if (isEdit) {
      const historyEntry = {
        id: generateId('h'),
        date: now,
        action: 'แก้ไขข้อมูล',
        holder: form.holder,
        device: form.device,
        whatsappAccount: form.whatsappAccount,
        note: form.note || 'อัพเดตข้อมูล',
      }
      const needsHistoryEntry =
        existing.holder !== form.holder ||
        existing.device !== form.device ||
        existing.whatsappAccount !== form.whatsappAccount

      dispatch({
        type: 'UPDATE_SIM',
        payload: {
          ...existing,
          ...form,
          history: needsHistoryEntry ? [...existing.history, { ...historyEntry, by: currentUser?.name }] : existing.history,
        },
      })
      navigate(`/sims/${id}`)
    } else {
      const formData = { ...form }
      delete formData.note
      const newSim = {
        id: generateId('sim'),
        ...formData,
        createdBy: currentUser?.name || '-',
        createdAt: now,
        history: [
          {
            id: generateId('h'),
            date: now,
            action: 'ลงทะเบียน',
            holder: form.holder,
            device: form.device || '-',
            whatsappAccount: form.whatsappAccount,
            note: form.note || 'ลงทะเบียนครั้งแรก',
            by: currentUser?.name || '-',
          },
        ],
      }
      dispatch({ type: 'ADD_SIM', payload: newSim })
      navigate('/sims')
    }
  }

  const fieldProps = { form, errors, setForm }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-secondary px-2 py-2" onClick={() => navigate(isEdit ? `/sims/${id}` : '/sims')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header mb-0">{isEdit ? 'แก้ไขซิมการ์ด' : 'เพิ่มซิมการ์ด'}</h1>
          <p className="text-xs text-gray-400">{isEdit ? `กำลังแก้ไข ${existing?.phoneNumber}` : 'ลงทะเบียนซิมใหม่'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-gray-700">ข้อมูลซิม</h2>
          <Field label="เบอร์โทรศัพท์" name="phoneNumber" required placeholder="เช่น 0812345678" {...fieldProps} />
          <Field label="Serial Number" name="serialNumber" placeholder="เช่น SN-TH-001" {...fieldProps} />
          <Field
            label="สถานะ"
            name="status"
            options={[
              { value: 'active', label: 'ใช้งานอยู่' },
              { value: 'idle', label: 'ว่าง' },
              { value: 'expired', label: 'หมดอายุ' },
            ]}
            {...fieldProps}
          />
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-gray-700">ข้อมูลการใช้งาน</h2>
          <Field label="บัญชี WhatsApp (หมายเลข PC)" name="whatsappAccount" placeholder="เช่น PC-01, PC-02" {...fieldProps} />
          <Field label="ผู้ถือครอง" name="holder" required placeholder="ชื่อคนที่เก็บซิม" {...fieldProps} />
          <Field label="อุปกรณ์ (รุ่นโทรศัพท์)" name="device" placeholder="เช่น Samsung A55, iPhone 14" {...fieldProps} />
          <Field label="ผู้ลงทะเบียน" name="registrar" placeholder="ชื่อพนักงาน/เอเย่นต์" {...fieldProps} />
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-gray-700">ข้อมูลเพิ่มเติม</h2>
          <div>
            <label className="label">ลิงก์รูปภาพ</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
          {isEdit && (
            <div>
              <label className="label">หมายเหตุการแก้ไข</label>
              <input
                type="text"
                className="input-field"
                placeholder="บันทึกเหตุผลการย้าย/แก้ไข"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3 text-base">
          <Save size={18} />
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มซิมการ์ด'}
        </button>
      </form>
    </div>
  )
}
