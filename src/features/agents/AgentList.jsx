import React, { useState } from 'react'
import { useNavigate } from '@/lib/navigation'
import { Plus, Search, ChevronRight, AlertCircle, Users } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import { formatCurrency, getDebt, getTotalSales, isDebtAlert } from '@/lib/utils'

export default function AgentList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterAlert, setFilterAlert] = useState(false)

  const agentsWithData = state.agents.map((a) => ({
    ...a,
    debt: getDebt(state.transactions, a.id),
    totalSales: getTotalSales(state.transactions, a.id),
    alert: isDebtAlert(state.transactions, a),
  }))

  const filtered = agentsWithData.filter((a) => {
    const matchSearch =
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.shopName.toLowerCase().includes(search.toLowerCase())
    const matchAlert = !filterAlert || a.alert
    return matchSearch && matchAlert
  })

  const alertCount = agentsWithData.filter((a) => a.alert).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">เอเย่นต์</h1>
          <p className="page-subtitle">ทั้งหมด {state.agents.length} ราย</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/agents/new')}>
          <Plus size={16} />
          เพิ่มเอเย่นต์
        </button>
      </div>

      {alertCount > 0 && (
        <div
          className="card debt-alert flex items-center gap-3 cursor-pointer"
          onClick={() => setFilterAlert(!filterAlert)}
        >
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">
              {alertCount} ราย มีหนี้ค้างเกินเกณฑ์
            </p>
            <p className="text-xs text-red-500">กดเพื่อ{filterAlert ? 'ดูทั้งหมด' : 'กรองเฉพาะรายที่มีปัญหา'}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${filterAlert ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>
            {filterAlert ? 'กรองอยู่' : 'กรอง'}
          </span>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input-field pl-9"
          placeholder="ค้นหาชื่อเจ้าของ หรือชื่อร้าน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card text-center py-10">
            <Users size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">ไม่พบข้อมูลเอเย่นต์</p>
          </div>
        )}
        {filtered.map((agent) => (
          <div
            key={agent.id}
            className={`card flex items-center gap-3 cursor-pointer active:bg-gray-50 hover:shadow-md transition-all ${agent.alert ? 'border-red-200 bg-red-50/30' : ''}`}
            onClick={() => navigate(`/agents/${agent.id}`)}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${agent.alert ? 'bg-red-100' : 'bg-blue-50'}`}>
              {agent.alert
                ? <AlertCircle size={20} className="text-red-500" />
                : <span className="text-blue-600 font-bold text-sm">{agent.shopName.charAt(0)}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 truncate">{agent.shopName}</p>
                {agent.alert && (
                  <span className="badge-unpaid flex-shrink-0">หนี้ค้าง</span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{agent.ownerName}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-gray-400">ต้องเก็บรวม: <span className="text-gray-700 font-medium">{formatCurrency(agent.totalSales)}</span></span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {agent.debt > 0 ? (
                <p className="text-sm font-bold text-red-600">-{formatCurrency(agent.debt)}</p>
              ) : (
                <p className="text-sm font-bold text-green-600">ปกติ</p>
              )}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Hold {agent.holdPercentage}%</span>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
