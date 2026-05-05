import React from 'react'
import { useNavigate } from '@/lib/navigation'
import { TrendingUp, AlertCircle, Wallet, Users, CheckCircle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useApp } from '@/features/app/AppContext'
import {
  formatCurrency, getMonthlyStats, getWeeklyStats,
  getTopAgents, getDebt, isDebtAlert, getMonthlyChartData
} from '@/lib/utils'

function StatCard({ label, value, sub, icon: Icon, color, onClick }) {
  return (
    <div
      className={`card flex items-center gap-3 cursor-pointer active:scale-95 transition-transform ${onClick ? 'hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

function DebtAlertBadge({ count }) {
  if (count === 0) return null
  return (
    <div className="card debt-alert flex items-center gap-3">
      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <AlertCircle size={20} className="text-red-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-red-700">แจ้งเตือนหนี้ค้าง!</p>
        <p className="text-xs text-red-600">มีเอเย่นต์ {count} ราย ที่ยอดหนี้เกินเกณฑ์ที่กำหนด</p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const { transactions, agents, sims } = state

  const monthly = getMonthlyStats(transactions)
  const weekly = getWeeklyStats(transactions)
  const chartData = getMonthlyChartData(transactions)
  const topAgents = getTopAgents(transactions, agents, 5)
  const alertAgents = agents.filter((a) => isDebtAlert(transactions, a))
  const totalDebt = agents.reduce((s, a) => s + getDebt(transactions, a.id), 0)
  const activeSims = sims.filter((s) => s.status === 'active').length

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-header">แดชบอร์ด</h1>
        <p className="page-subtitle">ภาพรวมระบบทั้งหมด</p>
      </div>

      <DebtAlertBadge count={alertAgents.length} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="ยอดต้องเก็บเดือนนี้"
          value={formatCurrency(monthly.totalSales)}
          sub={`${monthly.count} รายการ`}
          icon={TrendingUp}
          color="bg-blue-500"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          label="รวมหนี้คงค้าง"
          value={formatCurrency(totalDebt)}
          sub={`${alertAgents.length} ราย เกินเกณฑ์`}
          icon={Wallet}
          color={totalDebt > 0 ? 'bg-red-500' : 'bg-green-500'}
          onClick={() => navigate('/agents')}
        />
        <StatCard
          label="สัปดาห์นี้"
          value={formatCurrency(weekly.totalSales)}
          sub={`เก็บได้ ${formatCurrency(weekly.totalPaid)}`}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatCard
          label="ซิมใช้งาน"
          value={`${activeSims} / ${sims.length}`}
          sub={`เอเย่นต์ ${agents.length} ราย`}
          icon={Users}
          color="bg-purple-500"
          onClick={() => navigate('/sims')}
        />
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-3">ยอดขาย 6 เดือนย้อนหลัง</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" fill="url(#colorSales)" strokeWidth={2} />
            <Area type="monotone" dataKey="paid" name="Paid" stroke="#10b981" fill="url(#colorPaid)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-500">ยอดขาย</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-500">เก็บได้</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Top เอเย่นต์ ยอดขายรวม</h2>
        <div className="space-y-3">
          {topAgents.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีข้อมูล</p>
          )}
          {topAgents.map((agent, idx) => {
            const alert = isDebtAlert(transactions, agent)
            return (
              <div
                key={agent.id}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer active:bg-gray-50 ${alert ? 'bg-red-50' : ''}`}
                onClick={() => navigate(`/agents/${agent.id}`)}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                  idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-gray-200'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{agent.shopName}</p>
                  <p className="text-xs text-gray-500 truncate">{agent.ownerName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">{formatCurrency(agent.totalSales)}</p>
                  {agent.debt > 0 && (
                    <p className="text-xs text-red-500">ค้าง {formatCurrency(agent.debt)}</p>
                  )}
                </div>
                {alert && <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
