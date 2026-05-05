import React, { useState } from 'react'
import { Plus, Trash2, Edit2, Shield, Key, X, Check } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import { useAuth } from '@/features/auth/AuthContext'
import { generateId } from '@/lib/utils'

function StaffForm({ existing, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: existing?.name || '',
    pin: existing?.pin || '',
    confirmPin: '',
    role: existing?.role || 'staff',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'กรุณากรอกชื่อ'
    if (!existing && !form.pin) e.pin = 'กรุณากรอก PIN'
    if (form.pin && !/^\d{4,6}$/.test(form.pin)) e.pin = 'PIN ต้องเป็นตัวเลข 4-6 หลัก'
    if (form.pin && form.pin !== form.confirmPin) e.confirmPin = 'PIN ไม่ตรงกัน'
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    onSave({ name: form.name.trim(), pin: form.pin || existing?.pin, role: form.role })
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-bold text-gray-800 text-sm">{existing ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}</h3>

      <div>
        <label className="label">ชื่อพนักงาน <span className="text-red-500">*</span></label>
        <input
          className={`input-field ${errors.name ? 'border-red-400' : ''}`}
          placeholder="เช่น สมชาย, พนักงาน A"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="label">สิทธิ์</label>
        <select
          className="input-field"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="staff">พนักงาน</option>
          <option value="admin">ผู้ดูแลระบบ</option>
        </select>
      </div>

      <div>
        <label className="label">{existing ? 'PIN ใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'PIN (4-6 หลัก)'}{!existing && <span className="text-red-500"> *</span>}</label>
        <input
          className={`input-field ${errors.pin ? 'border-red-400' : ''}`}
          type="password"
          inputMode="numeric"
          placeholder="••••"
          maxLength={6}
          value={form.pin}
          onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
        />
        {errors.pin && <p className="text-xs text-red-500 mt-1">{errors.pin}</p>}
      </div>

      {form.pin ? (
        <div>
          <label className="label">ยืนยัน PIN</label>
          <input
            className={`input-field ${errors.confirmPin ? 'border-red-400' : ''}`}
            type="password"
            inputMode="numeric"
            placeholder="••••"
            maxLength={6}
            value={form.confirmPin}
            onChange={(e) => setForm({ ...form, confirmPin: e.target.value.replace(/\D/g, '') })}
          />
          {errors.confirmPin && <p className="text-xs text-red-500 mt-1">{errors.confirmPin}</p>}
        </div>
      ) : null}

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1 justify-center" onClick={onCancel}>
          <X size={15} /> ยกเลิก
        </button>
        <button className="btn-primary flex-1 justify-center" onClick={handleSave}>
          <Check size={15} /> บันทึก
        </button>
      </div>
    </div>
  )
}

export default function StaffList() {
  const { state, dispatch } = useApp()
  const { currentUser } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const staff = state.staff || []
  const isAdmin = currentUser?.role === 'admin'

  function handleAdd(data) {
    dispatch({
      type: 'ADD_STAFF',
      payload: {
        id: generateId('staff'),
        ...data,
        createdAt: new Date().toISOString(),
      },
    })
    setShowForm(false)
  }

  function handleEdit(data) {
    const existing = staff.find((s) => s.id === editingId)
    dispatch({
      type: 'UPDATE_STAFF',
      payload: { ...existing, ...data },
    })
    setEditingId(null)
  }

  function handleDelete(id) {
    if (id === 'staff-admin') return
    dispatch({ type: 'DELETE_STAFF', payload: id })
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">จัดการพนักงาน</h1>
          <p className="page-subtitle">ทั้งหมด {staff.length} บัญชี</p>
        </div>
        {isAdmin && (
          <button className="btn-primary text-sm px-3 py-2" onClick={() => { setShowForm(true); setEditingId(null) }}>
            <Plus size={15} /> เพิ่ม
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="card bg-yellow-50 border border-yellow-200 flex items-start gap-2">
          <Shield size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700">เฉพาะแอดมินเท่านั้นที่สามารถแก้ไขข้อมูลพนักงานได้</p>
        </div>
      )}

      {showForm && (
        <StaffForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <div className="space-y-2">
        {staff.map((s) => (
          <div key={s.id}>
            {editingId === s.id ? (
              <StaffForm
                existing={s}
                onSave={handleEdit}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="card flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  s.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                    {s.role === 'admin' && (
                      <span className="flex items-center gap-0.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-medium">
                        <Shield size={10} /> แอดมิน
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Key size={11} className="text-gray-300" />
                    <p className="text-xs text-gray-400">PIN: {'•'.repeat(s.pin.length)}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      className="btn-secondary px-2 py-2"
                      onClick={() => { setEditingId(s.id); setShowForm(false) }}
                    >
                      <Edit2 size={14} />
                    </button>
                    {s.id !== 'staff-admin' && (
                      <button
                        className="btn-danger px-2 py-2"
                        onClick={() => setDeleteId(s.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">ลบบัญชีพนักงาน?</h3>
            <p className="text-sm text-gray-500 mb-4">
              บัญชี "{staff.find((s) => s.id === deleteId)?.name}" จะถูกลบออก
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 justify-center" onClick={() => setDeleteId(null)}>ยกเลิก</button>
              <button className="btn-danger flex-1 justify-center" onClick={() => handleDelete(deleteId)}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
