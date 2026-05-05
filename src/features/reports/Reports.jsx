import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import {
  formatCurrency, formatDate, filterTransactionsByDateRange,
  getMonthlyStats, getWeeklyStats, resolveAmountDue
} from '@/lib/utils'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

const PRESETS = [
  { label: 'สัปดาห์นี้', getValue: () => ({ start: format(subDays(new Date(), 6), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'เดือนนี้', getValue: () => ({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) },
  { label: 'เดือนที่แล้ว', getValue: () => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return { start: format(startOfMonth(d), 'yyyy-MM-dd'), end: format(endOfMonth(d), 'yyyy-MM-dd') }
  }},
  { label: '30 วันล่าสุด', getValue: () => ({ start: format(subDays(new Date(), 29), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
]

function SummaryCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={19} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-base font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
        <p className="font-bold text-gray-700 mb-1 truncate max-w-32">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.fill }}>
            {p.dataKey === 'sales' ? 'Sales' : 'Debt'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Reports() {
  const { state } = useApp()
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const filtered = filterTransactionsByDateRange(state.transactions, startDate, endDate)
  const monthly = getMonthlyStats(state.transactions)
  const weekly = getWeeklyStats(state.transactions)

  const totalSales = filtered.reduce((s, t) => s + resolveAmountDue(t), 0)
  const totalPaid = filtered.reduce((s, t) => {
    const due = resolveAmountDue(t)
    if (t.paymentStatus === 'paid') return s + due
    if (t.paymentStatus === 'partial') return s + (t.paidAmount || 0)
    return s
  }, 0)
  const totalDebt = totalSales - totalPaid

  const agentBreakdown = state.agents.map((a) => {
    const agentTx = filtered.filter((t) => t.agentId === a.id)
    const sales = agentTx.reduce((s, t) => s + resolveAmountDue(t), 0)
    const paid = agentTx.reduce((s, t) => {
      const due = resolveAmountDue(t)
      if (t.paymentStatus === 'paid') return s + due
      if (t.paymentStatus === 'partial') return s + (t.paidAmount || 0)
      return s
    }, 0)
    return {
      ...a,
      sales,
      debt: sales - paid,
      count: agentTx.length,
    }
  }).filter((a) => a.sales > 0).sort((a, b) => b.sales - a.sales)

  const paidCount = filtered.filter((t) => t.paymentStatus === 'paid').length
  const unpaidCount = filtered.filter((t) => t.paymentStatus === 'unpaid').length
  const partialCount = filtered.filter((t) => t.paymentStatus === 'partial').length

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-header">รายงาน</h1>
        <p className="page-subtitle">สรุปยอดและวิเคราะห์ผล</p>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-blue-500" />
          <span className="text-sm font-bold text-gray-700">เลือกช่วงวันที่</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { const v = p.getValue(); setStartDate(v.start); setEndDate(v.end) }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">จากวันที่</label>
            <input
              type="date"
              className="input-field text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-xs">ถึงวันที่</label>
            <input
              type="date"
              className="input-field text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">
          พบ {filtered.length} รายการ ระหว่าง {formatDate(startDate)} – {formatDate(endDate)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="ยอดขายรวม" value={formatCurrency(totalSales)} sub={`${filtered.length} รายการ`} icon={TrendingUp} color="bg-blue-500" />
        <SummaryCard label="เก็บเงินได้" value={formatCurrency(totalPaid)} sub={`${paidCount} รายการ`} icon={CheckCircle} color="bg-green-500" />
        <SummaryCard label="ยังไม่ได้รับ" value={formatCurrency(totalDebt)} sub={`${unpaidCount + partialCount} รายการ`} icon={AlertCircle} color={totalDebt > 0 ? 'bg-red-500' : 'bg-gray-300'} />
        <div className="card p-3 flex flex-col justify-center">
          <p className="text-xs text-gray-400 mb-2">สถานะรายการ</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-600">จ่ายแล้ว</span>
              <span className="font-bold">{paidCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-yellow-600">บางส่วน</span>
              <span className="font-bold">{partialCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-600">ยังไม่จ่าย</span>
              <span className="font-bold">{unpaidCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="text-sm font-bold text-gray-700 mb-1">ยอดขาย vs หนี้ค้าง รายเอเย่นต์</h2>
        {agentBreakdown.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">ไม่มีข้อมูลในช่วงนี้</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, agentBreakdown.length * 50)}>
            <BarChart
              data={agentBreakdown}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="shopName" tick={{ fontSize: 10, fill: '#374151' }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={16} />
              <Bar dataKey="debt" name="Debt" fill="#f87171" radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-gray-500">ยอดขาย</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-gray-500">หนี้ค้าง</span></div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-3">สรุปรายเอเย่นต์</h2>
        {agentBreakdown.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">ไม่มีข้อมูลในช่วงนี้</p>
        ) : (
          <div className="space-y-0">
            <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 pb-2 border-b border-gray-100">
              <span className="col-span-2">เอเย่นต์</span>
              <span className="text-right">ยอดขาย</span>
              <span className="text-right">ค้าง</span>
            </div>
            {agentBreakdown.map((a) => (
              <div key={a.id} className="grid grid-cols-4 text-sm py-2.5 border-b border-gray-50 last:border-0">
                <div className="col-span-2 min-w-0">
                  <p className="font-medium text-gray-800 truncate text-xs">{a.shopName}</p>
                  <p className="text-xs text-gray-400">{a.count} รายการ</p>
                </div>
                <p className="text-right font-semibold text-gray-800 text-xs">{formatCurrency(a.sales)}</p>
                <p className={`text-right font-semibold text-xs ${a.debt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {a.debt > 0 ? formatCurrency(a.debt) : '✓'}
                </p>
              </div>
            ))}
            <div className="grid grid-cols-4 text-sm pt-2 font-bold border-t-2 border-gray-200 mt-1">
              <div className="col-span-2 text-xs text-gray-600">รวม</div>
              <p className="text-right text-xs text-blue-600">{formatCurrency(totalSales)}</p>
              <p className={`text-right text-xs ${totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(totalDebt)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-2">
        <h2 className="text-sm font-bold text-gray-700">เปรียบเทียบรายงาน</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-500 font-medium mb-1">สัปดาห์นี้</p>
            <p className="text-sm font-bold text-blue-800">{formatCurrency(weekly.totalSales)}</p>
            <p className="text-xs text-blue-400">เก็บได้ {formatCurrency(weekly.totalPaid)}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-xs text-purple-500 font-medium mb-1">เดือนนี้</p>
            <p className="text-sm font-bold text-purple-800">{formatCurrency(monthly.totalSales)}</p>
            <p className="text-xs text-purple-400">เก็บได้ {formatCurrency(monthly.totalPaid)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
