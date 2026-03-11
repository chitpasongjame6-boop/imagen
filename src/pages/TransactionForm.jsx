import React, { useState, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Calculator } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { generateId, formatCurrency, getAmountDue } from '../utils/helpers'

export default function TransactionForm() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preAgentId = searchParams.get('agentId') || ''

  const isEdit = Boolean(id && id !== 'new')
  const existing = isEdit ? state.transactions.find((t) => t.id === id) : null

  const [form, setForm] = useState({
    agentId: existing?.agentId || preAgentId,
    date: existing?.date ? existing.date.slice(0, 16) : new Date().toISOString().slice(0, 16),
    creditAmount: existing?.creditAmount ?? '',
    paymentStatus: existing?.paymentStatus || 'unpaid',
    paidAmount: existing?.paidAmount ?? '',
    note: existing?.note || '',
  })
  const [errors, setErrors] = useState({})
  const [showDelete, setShowDelete] = useState(false)

  const selectedAgent = useMemo(
    () => state.agents.find((a) => a.id === form.agentId),
    [state.agents, form.agentId]
  )

  const holdPct = selectedAgent?.holdPercentage ?? 0
  const credit = Number(form.creditAmount) || 0
  const agentKeeps = Math.round(credit * (holdPct / 100))
  const amountDue = getAmountDue(credit, holdPct)
  const paidAmt = Number(form.paidAmount) || 0
  const remaining =
    form.paymentStatus === 'unpaid'
      ? amountDue
      : form.paymentStatus === 'partial'
      ? amountDue - paidAmt
      : 0

  function validate() {
    const e = {}
    if (!form.agentId) e.agentId = 'กรุณาเลือกเอเย่นต์'
    if (!form.creditAmount || credit <= 0) e.creditAmount = 'กรุณากรอกจำนวนเครดิต'
    if (form.paymentStatus === 'partial') {
      if (!form.paidAmount || paidAmt <= 0) e.paidAmount = 'กรุณากรอกยอดที่จ่ายแล้ว'
      if (paidAmt >= amountDue) e.paidAmount = 'ยอดที่จ่ายต้องน้อยกว่ายอดที่ต้องจ่าย'
    }
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const finalPaid =
      form.paymentStatus === 'paid'
        ? amountDue
        : form.paymentStatus === 'partial'
        ? paidAmt
        : 0

    const payload = {
      agentId: form.agentId,
      date: new Date(form.date).toISOString(),
      creditAmount: credit,
      holdPercentage: holdPct,
      amountDue,
      paymentStatus: form.paymentStatus,
      paidAmount: finalPaid,
      note: form.note,
      createdBy: existing?.createdBy || currentUser?.name || '-',
    }

    if (isEdit) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...existing, ...payload } })
      navigate(-1)
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: { id: generateId('tx'), ...payload } })
      navigate(form.agentId ? `/agents/${form.agentId}` : '/transactions')
    }
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_TRANSACTION', payload: existing.id })
    navigate(-1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-secondary px-2 py-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="page-header mb-0">{isEdit ? 'แก้ไขธุรกรรม' : 'เติมเครดิตเอเย่นต์'}</h1>
          <p className="text-xs text-gray-400">บันทึกการเติมเครดิตและคำนวณยอดจ่าย</p>
        </div>
        {isEdit && (
          <button className="btn-danger px-2 py-2" onClick={() => setShowDelete(true)}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-gray-700">เลือกเอเย่นต์</h2>
          <div>
            <label className="label">เอเย่นต์ <span className="text-red-500">*</span></label>
            <select
              className={`input-field ${errors.agentId ? 'border-red-400' : ''}`}
              value={form.agentId}
              onChange={(e) => setForm({ ...form, agentId: e.target.value })}
            >
              <option value="">-- เลือกเอเย่นต์ --</option>
              {state.agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.shopName} — Hold {a.holdPercentage}%
                </option>
              ))}
            </select>
            {errors.agentId && <p className="text-xs text-red-500 mt-1">{errors.agentId}</p>}
          </div>

          {selectedAgent && (
            <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-blue-600">{selectedAgent.ownerName}</span>
              <span className="text-xs font-bold text-blue-700">Hold {holdPct}% → เจ้าของได้ {100 - holdPct}%</span>
            </div>
          )}

          <div>
            <label className="label">วันที่/เวลา</label>
            <input
              type="datetime-local"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Calculator size={16} className="text-blue-500" />
            คำนวณยอดเครดิต
          </h2>

          <div>
            <label className="label">จำนวนเครดิตที่เติมให้เอเย่นต์ <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">C</span>
              <input
                type="number"
                min="0"
                step="100"
                className={`input-field pl-7 text-lg font-bold ${errors.creditAmount ? 'border-red-400' : ''}`}
                placeholder="เช่น 50000"
                value={form.creditAmount}
                onChange={(e) => setForm({ ...form, creditAmount: e.target.value })}
              />
            </div>
            {errors.creditAmount && <p className="text-xs text-red-500 mt-1">{errors.creditAmount}</p>}
          </div>

          {credit > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">สรุปการคำนวณ</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">เครดิตทั้งหมด</span>
                <span className="font-semibold text-gray-800">{credit.toLocaleString()} เครดิต</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">เอเย่นต์ได้รับ ({holdPct}%)</span>
                <span className="font-semibold text-orange-600">
                  {agentKeeps.toLocaleString()} เครดิต = {formatCurrency(agentKeeps)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">เอเย่นต์ต้องจ่ายให้เรา</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(amountDue)}</span>
              </div>
              <p className="text-xs text-gray-400 text-right">
                ({credit.toLocaleString()} × {100 - holdPct}% = {formatCurrency(amountDue)})
              </p>
            </div>
          )}
        </div>

        {credit > 0 && (
          <div className="card space-y-3">
            <h2 className="text-sm font-bold text-gray-700">สถานะการชำระเงิน</h2>
            <p className="text-xs text-gray-500">
              ยอดที่เอเย่นต์ต้องจ่าย: <span className="font-bold text-blue-600">{formatCurrency(amountDue)}</span>
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'unpaid', label: 'ยังไม่จ่าย', color: 'border-red-400 bg-red-50 text-red-700' },
                { value: 'partial', label: 'จ่ายบางส่วน', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
                { value: 'paid', label: 'จ่ายครบแล้ว', color: 'border-green-400 bg-green-50 text-green-700' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, paymentStatus: opt.value })}
                  className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    form.paymentStatus === opt.value ? opt.color : 'border-gray-200 bg-white text-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {form.paymentStatus === 'partial' && (
              <div>
                <label className="label">ยอดที่จ่ายมาแล้ว (บาท) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">฿</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    max={amountDue - 1}
                    className={`input-field pl-7 ${errors.paidAmount ? 'border-red-400' : ''}`}
                    placeholder="0"
                    value={form.paidAmount}
                    onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                  />
                </div>
                {errors.paidAmount && <p className="text-xs text-red-500 mt-1">{errors.paidAmount}</p>}
              </div>
            )}

            {form.paymentStatus !== 'paid' && remaining > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex justify-between items-center">
                <p className="text-xs text-red-600 font-medium">ยอดค้างชำระ</p>
                <p className="text-base font-bold text-red-600">{formatCurrency(remaining)}</p>
              </div>
            )}

            {form.paymentStatus === 'paid' && credit > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex justify-between items-center">
                <p className="text-xs text-green-600 font-medium">ชำระครบแล้ว</p>
                <p className="text-base font-bold text-green-600">{formatCurrency(amountDue)}</p>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <label className="label">หมายเหตุ</label>
          <input
            type="text"
            className="input-field"
            placeholder="บันทึกเพิ่มเติม..."
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3 text-base">
          <Save size={18} />
          {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
        </button>
      </form>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">ลบธุรกรรม?</h3>
            <p className="text-sm text-gray-500 mb-4">ต้องการลบธุรกรรมนี้? ข้อมูลจะหายถาวร</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 justify-center" onClick={() => setShowDelete(false)}>ยกเลิก</button>
              <button className="btn-danger flex-1 justify-center" onClick={handleDelete}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
