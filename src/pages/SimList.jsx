import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronRight, Phone, Monitor } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getStatusLabel } from '../utils/helpers'

export default function SimList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = state.sims.filter((s) => {
    const matchSearch =
      s.phoneNumber.includes(search) ||
      s.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.holder.toLowerCase().includes(search.toLowerCase()) ||
      (s.whatsappAccount && s.whatsappAccount.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const statusCounts = {
    all: state.sims.length,
    active: state.sims.filter((s) => s.status === 'active').length,
    idle: state.sims.filter((s) => s.status === 'idle').length,
    expired: state.sims.filter((s) => s.status === 'expired').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">ซิมการ์ด</h1>
          <p className="page-subtitle">ทั้งหมด {state.sims.length} หมายเลข</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/sims/new')}>
          <Plus size={16} />
          เพิ่มซิม
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input-field pl-9"
          placeholder="ค้นหาเบอร์, Serial, ผู้ถือ, PC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'active', label: 'ใช้งานอยู่' },
          { key: 'idle', label: 'ว่าง' },
          { key: 'expired', label: 'หมดอายุ' },
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
            {label} ({statusCounts[key]})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card text-center py-10">
            <Phone size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">ไม่พบข้อมูลซิมการ์ด</p>
          </div>
        )}
        {filtered.map((sim) => (
            <div
              key={sim.id}
              className="card flex items-center gap-3 cursor-pointer active:bg-gray-50 hover:shadow-md transition-all"
              onClick={() => navigate(`/sims/${sim.id}`)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                sim.status === 'active' ? 'bg-green-100' : sim.status === 'idle' ? 'bg-gray-100' : 'bg-red-100'
              }`}>
                <Phone size={18} className={
                  sim.status === 'active' ? 'text-green-600' : sim.status === 'idle' ? 'text-gray-400' : 'text-red-600'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{sim.phoneNumber}</p>
                  <span className={`${
                    sim.status === 'active' ? 'badge-active' : sim.status === 'idle' ? 'badge-idle' : 'badge-expired'
                  }`}>
                    {getStatusLabel(sim.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {sim.whatsappAccount && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-medium">
                      <Monitor size={10} />
                      {sim.whatsappAccount}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 truncate">{sim.holder}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-xs text-gray-400">{sim.device}</p>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
        ))}
      </div>
    </div>
  )
}
