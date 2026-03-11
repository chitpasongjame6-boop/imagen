import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { generateId } from '../utils/helpers'

export default function AgentForm() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const isEdit = Boolean(id && id !== 'new')
  const existing = isEdit ? state.agents.find((a) => a.id === id) : null

  const [form, setForm] = useState({
    ownerName: existing?.ownerName || '',
    shopName: existing?.shopName || '',
    holdPercentage: existing?.holdPercentage ?? 25,
    debtAlertDays: existing?.debtAlertDays ?? 7,
    debtAlertAmount: existing?.debtAlertAmount ?? 5000,
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.ownerName.trim()) e.ownerName = 'กรุณากรอกชื่อเจ้าของ'
    if (!form.shopName.trim()) e.shopName = 'กรุณากรอกชื่อร้าน'
    if (form.holdPercentage < 0 || form.holdPercentage > 100) e.holdPercentage = 'ต้องอยู่ระหว่าง 0-100'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    if (isEdit) {
      dispatch({
        type: 'UPDATE_AGENT',
        payload: {
          ...existing,
          ...form,
          holdPercentage: Number(form.holdPercentage),
          debtAlertDays: Number(form.debtAlertDays),
          debtAlertAmount: Number(form.debtAlertAmount),
        },
      })
      navigate(`/agents/${id}`)
    } else {
      dispatch({
        type: 'ADD_AGENT',
        payload: {
          id: generateId('agent'),
          ...form,
          holdPercentage: Number(form.holdPercentage),
          debtAlertDays: Number(form.debtAlertDays),
          debtAlertAmount: Number(form.debtAlertAmount),
          createdBy: currentUser?.name || '-',
          createdAt: new Date().toISOString(),
        },
      })
      navigate('/agents')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-secondary px-2 py-2" onClick={() => navigate(isEdit ? `/agents/${id}` : '/agents')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header mb-0">{isEdit ? 'แก้ไขเอเย่นต์' : 'เพิ่มเอเย่นต์'}</h1>
          <p className="text-xs text-gray-400">{isEdit ? `กำลังแก้ไข ${existing?.shopName}` : 'ลงทะเบียนเอเย่นต์ใหม่'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-gray-700">ข้อมูลเอเย่นต์</h2>

          <div>
            <label className="label">ชื่อเจ้าของ <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`input-field ${errors.ownerName ? 'border-red-400' : ''}`}
              placeholder="เช่น สมชาย มีสุข"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
            {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>}
          </div>

          <div>
            <label className="label">ชื่อร้าน (Agent Name) <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`input-field ${errors.shopName ? 'border-red-400' : ''}`}
              placeholder="เช่น ร้าน SM Shop"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            />
            {errors.shopName && <p className="text-xs text-red-500 mt-1">{errors.shopName}</p>}
          </div>

          <div>
            <label className="label">% ส่วนแบ่ง (Hold Percentage)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                className={`input-field pr-8 ${errors.holdPercentage ? 'border-red-400' : ''}`}
                value={form.holdPercentage}
                onChange={(e) => setForm({ ...form, holdPercentage: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
            {errors.holdPercentage && <p className="text-xs text-red-500 mt-1">{errors.holdPercentage}</p>}
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-gray-700">การตั้งค่าแจ้งเตือนหนี้</h2>
          <p className="text-xs text-gray-500">ระบบจะแสดงแถบแดงเมื่อหนี้ค้างเกินเกณฑ์ที่กำหนด</p>

          <div>
            <label className="label">แจ้งเตือนเมื่อค้างเกิน (วัน)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                className="input-field pr-12"
                value={form.debtAlertDays}
                onChange={(e) => setForm({ ...form, debtAlertDays: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">วัน</span>
            </div>
          </div>

          <div>
            <label className="label">แจ้งเตือนเมื่อหนี้เกิน (บาท)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                className="input-field pr-12"
                value={form.debtAlertAmount}
                onChange={(e) => setForm({ ...form, debtAlertAmount: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">฿</span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3 text-base">
          <Save size={18} />
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มเอเย่นต์'}
        </button>
      </form>
    </div>
  )
}
