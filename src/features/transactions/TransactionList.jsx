import React, { useState } from 'react'
import { useNavigate, useSearchParams } from '@/lib/navigation'
import { Plus, Filter, ChevronRight, FileText } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import { formatCurrency, formatDateTime, getPaymentStatusLabel, resolveAmountDue } from '@/lib/utils'

export default function TransactionList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preAgentId = searchParams.get('agentId') || 'all'
  const [filterAgent, setFilterAgent] = useState(preAgentId)
  const [filterStatus, setFilterStatus] = useState('all')

  const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))

  const filtered = sorted.filter((t) => {
    const matchAgent = filterAgent === 'all' || t.agentId === filterAgent
    const matchStatus = filterStatus === 'all' || t.paymentStatus === filterStatus
    return matchAgent && matchStatus
  })

  const totalAmount = filtered.reduce((s, t) => s + resolveAmountDue(t), 0)
  const totalDebt = filtered.reduce((s, t) => {
    const due = resolveAmountDue(t)
    if (t.paymentStatus === 'unpaid') return s + due
    if (t.paymentStatus === 'partial') return s + (due - (t.paidAmount || 0))
    return s
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">ธุรกรรม</h1>
          <p className="page-subtitle">ทั้งหมด {filtered.length} รายการ</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/transactions/new')}>
          <Plus size={16} />
          เพิ่ม
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xs text-gray-400">รวมยอดทั้งหมด</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-gray-400">ยังไม่ได้รับเงิน</p>
          <p className={`text-base font-bold ${totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(totalDebt)}
          </p>
        </div>
      </div>

      <div className="card p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">กรอง</span>
        </div>
        <div>
          <label className="label text-xs">เอเย่นต์</label>
          <select
            className="input-field text-sm"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            {state.agents.map((a) => (
              <option key={a.id} value={a.id}>{a.shopName}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'unpaid', label: 'ยังไม่จ่าย' },
            { key: 'partial', label: 'จ่ายบางส่วน' },
            { key: 'paid', label: 'จ่ายแล้ว' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterStatus === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card text-center py-10">
            <FileText size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">ไม่พบธุรกรรม</p>
          </div>
        )}
        {filtered.map((tx) => {
          const agent = state.agents.find((a) => a.id === tx.agentId)
          return (
            <div
              key={tx.id}
              className="card flex items-center gap-3 cursor-pointer active:bg-gray-50 hover:shadow-md transition-all"
              onClick={() => navigate(`/transactions/${tx.id}`)}
            >
              <div className={`w-2 self-stretch rounded-full flex-shrink-0 ${
                tx.paymentStatus === 'paid' ? 'bg-green-400' :
                tx.paymentStatus === 'unpaid' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-gray-400">{tx.creditAmount.toLocaleString()} C →</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(resolveAmountDue(tx))}</p>
                  <span className={`${
                    tx.paymentStatus === 'paid' ? 'badge-paid' :
                    tx.paymentStatus === 'unpaid' ? 'badge-unpaid' : 'badge-partial'
                  }`}>
                    {getPaymentStatusLabel(tx.paymentStatus)}
                  </span>
                </div>
                {agent && <p className="text-xs text-blue-600 font-medium truncate">{agent.shopName}</p>}
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">{formatDateTime(tx.date)}</p>
                  {tx.createdBy && <p className="text-xs text-gray-400">· โดย <span className="font-medium text-gray-600">{tx.createdBy}</span></p>}
                </div>
                {tx.note && <p className="text-xs text-gray-500 truncate italic">{tx.note}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {tx.paymentStatus !== 'paid' && (() => {
                  const due = resolveAmountDue(tx)
                  const r = tx.paymentStatus === 'unpaid' ? due : due - (tx.paidAmount || 0)
                  return r > 0 ? <p className="text-xs text-red-500 font-semibold">ค้าง {formatCurrency(r)}</p> : null
                })()}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
