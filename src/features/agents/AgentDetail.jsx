import React, { useState } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { ArrowLeft, Edit2, Trash2, Plus, AlertCircle } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import {
  formatCurrency, formatDateTime, getDebt,
  getTotalSales, getTotalCredits, isDebtAlert, getPaymentStatusLabel, resolveAmountDue
} from '@/lib/utils'

export default function AgentDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)

  const agent = state.agents.find((a) => a.id === id)
  if (!agent) return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-gray-400">ไม่พบข้อมูลเอเย่นต์</p>
      <button className="btn-secondary mt-4" onClick={() => navigate('/agents')}>
        <ArrowLeft size={16} /> กลับ
      </button>
    </div>
  )

  const agentTxs = state.transactions
    .filter((t) => t.agentId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const debt = getDebt(state.transactions, id)
  const totalCredits = getTotalCredits(state.transactions, id)
  const totalAmountDue = getTotalSales(state.transactions, id)
  const totalPaid = agentTxs.reduce((s, t) => s + (t.paidAmount || 0), 0)
  const alertStatus = isDebtAlert(state.transactions, agent)

  function handleDelete() {
    dispatch({ type: 'DELETE_AGENT', payload: agent.id })
    navigate('/agents')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-secondary px-2 py-2" onClick={() => navigate('/agents')}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="page-header mb-0 truncate">{agent.shopName}</h1>
          <p className="text-xs text-gray-400">{agent.ownerName}</p>
        </div>
        <button className="btn-secondary px-2 py-2" onClick={() => navigate(`/agents/${id}/edit`)}>
          <Edit2 size={16} />
        </button>
        <button className="btn-danger px-2 py-2" onClick={() => setShowDelete(true)}>
          <Trash2 size={16} />
        </button>
      </div>

      {alertStatus && (
        <div className="card debt-alert flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">หนี้ค้างเกินเกณฑ์!</p>
            <p className="text-xs text-red-600">ยอดค้างชำระ {formatCurrency(debt)} — กรุณาติดตามเก็บเงิน</p>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="bg-blue-600 px-4 py-3">
          <p className="text-xs text-blue-200 font-medium">เครดิตสะสมทั้งหมด</p>
          <p className="text-2xl font-bold text-white">{totalCredits.toLocaleString()} C</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="text-center p-3">
            <p className="text-xs text-gray-400 mb-0.5">ต้องจ่ายรวม</p>
            <p className="text-sm font-bold text-gray-800">{formatCurrency(totalAmountDue)}</p>
          </div>
          <div className="text-center p-3">
            <p className="text-xs text-gray-400 mb-0.5">จ่ายแล้ว</p>
            <p className="text-sm font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="text-center p-3">
            <p className="text-xs text-gray-400 mb-0.5">ค้างอยู่</p>
            <p className={`text-sm font-bold ${debt > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(debt)}</p>
          </div>
        </div>
      </div>

      <div className="card p-3 bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-600 font-semibold mb-1">สูตรคำนวณ</p>
        <p className="text-xs text-blue-700">
          เครดิต × (100% − Hold {agent.holdPercentage}%) = ยอดที่เอเย่นต์ต้องจ่าย
        </p>
        <p className="text-xs text-blue-500 mt-1">
          เช่น 50,000C × {100 - agent.holdPercentage}% = {formatCurrency(50000 * (1 - agent.holdPercentage / 100))}
        </p>
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-3">ข้อมูลเอเย่นต์</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ชื่อเจ้าของ</span>
            <span className="font-medium text-gray-800">{agent.ownerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ชื่อร้าน</span>
            <span className="font-medium text-gray-800">{agent.shopName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">% ส่วนแบ่ง (Hold)</span>
            <span className="font-bold text-blue-600">{agent.holdPercentage}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">แจ้งเตือนหนี้เกิน</span>
            <span className="font-medium text-gray-800">{agent.debtAlertDays} วัน / {formatCurrency(agent.debtAlertAmount)}</span>
          </div>
        </div>
      </div>


      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">ประวัติธุรกรรม ({agentTxs.length})</h2>
          <button
            className="btn-primary text-xs px-3 py-1.5"
            onClick={() => navigate(`/transactions/new?agentId=${id}`)}
          >
            <Plus size={13} /> เพิ่ม
          </button>
        </div>
        {agentTxs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีธุรกรรม</p>
        )}
        <div className="space-y-2">
          {agentTxs.slice(0, 10).map((tx) => {
            const due = resolveAmountDue(tx)
            const txDebt = tx.paymentStatus === 'unpaid' ? due : tx.paymentStatus === 'partial' ? due - (tx.paidAmount || 0) : 0
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 cursor-pointer"
                onClick={() => navigate(`/transactions/${tx.id}`)}
              >
                <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${
                  tx.paymentStatus === 'paid' ? 'bg-green-400' : tx.paymentStatus === 'unpaid' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{tx.creditAmount.toLocaleString()} C</p>
                    <span className="text-gray-300">→</span>
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(due)}</p>
                    <span className={`${
                      tx.paymentStatus === 'paid' ? 'badge-paid' :
                      tx.paymentStatus === 'unpaid' ? 'badge-unpaid' : 'badge-partial'
                    }`}>
                      {getPaymentStatusLabel(tx.paymentStatus)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{formatDateTime(tx.date)}</p>
                    {tx.createdBy && <p className="text-xs text-gray-400">· <span className="font-medium text-gray-600">{tx.createdBy}</span></p>}
                  </div>
                  {tx.note && <p className="text-xs text-gray-500 italic truncate">{tx.note}</p>}
                </div>
                {txDebt > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-red-500 font-semibold">ค้าง</p>
                    <p className="text-xs text-red-600 font-bold">{formatCurrency(txDebt)}</p>
                  </div>
                )}
              </div>
            )
          })}
          {agentTxs.length > 10 && (
            <button
              className="w-full text-center text-xs text-blue-600 py-2"
              onClick={() => navigate(`/transactions?agentId=${id}`)}
            >
              ดูทั้งหมด {agentTxs.length} รายการ
            </button>
          )}
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">ลบเอเย่นต์?</h3>
            <p className="text-sm text-gray-500 mb-4">
              ต้องการลบ {agent.shopName} ออกจากระบบ? ข้อมูลเอเย่นต์จะหายถาวร (ธุรกรรมยังคงอยู่)
            </p>
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
