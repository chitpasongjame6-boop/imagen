import React, { useState } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { ArrowLeft, Edit2, Trash2, Clock, Monitor, User, Smartphone, Image, UserCheck, Phone } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import { formatDateTime, getStatusLabel } from '@/lib/utils'

function InfoRow({ icon: Icon, label, value }) {
  if (!value || value === '-') return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
      </div>
    </div>
  )
}

export default function SimDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)

  const sim = state.sims.find((s) => s.id === id)
  if (!sim) return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-gray-400">ไม่พบข้อมูลซิม</p>
      <button className="btn-secondary mt-4" onClick={() => navigate('/sims')}>
        <ArrowLeft size={16} /> กลับ
      </button>
    </div>
  )

  function handleDelete() {
    dispatch({ type: 'DELETE_SIM', payload: sim.id })
    navigate('/sims')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-secondary px-2 py-2" onClick={() => navigate('/sims')}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="page-header mb-0">{sim.phoneNumber}</h1>
          <p className="text-xs text-gray-400">{sim.serialNumber}</p>
        </div>
        <button className="btn-secondary px-2 py-2" onClick={() => navigate(`/sims/${id}/edit`)}>
          <Edit2 size={16} />
        </button>
        <button className="btn-danger px-2 py-2" onClick={() => setShowDelete(true)}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className={`${
          sim.status === 'active' ? 'badge-active' : sim.status === 'idle' ? 'badge-idle' : 'badge-expired'
        } text-sm`}>
          {getStatusLabel(sim.status)}
        </span>
        {sim.whatsappAccount && (
          <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full font-semibold">
            <Monitor size={12} />
            {sim.whatsappAccount}
          </span>
        )}
      </div>

      {sim.imageUrl && (
        <div className="card p-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sim.imageUrl} alt="sim" className="w-full h-48 object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        </div>
      )}

      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-2">ข้อมูลซิมการ์ด</h2>
        <InfoRow icon={Phone} label="เบอร์โทรศัพท์" value={sim.phoneNumber} />
        <InfoRow icon={Phone} label="Serial Number" value={sim.serialNumber} />
        <InfoRow icon={Monitor} label="บัญชี WhatsApp (PC)" value={sim.whatsappAccount} />
        <InfoRow icon={User} label="ผู้ถือครอง" value={sim.holder} />
        <InfoRow icon={Smartphone} label="อุปกรณ์" value={sim.device} />
        <InfoRow icon={UserCheck} label="ผู้ลงทะเบียน" value={sim.registrar} />
        <InfoRow icon={Image} label="ลิงก์รูปภาพ" value={sim.imageUrl} />
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-3">ประวัติการย้ายซิม</h2>
        {sim.history.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีประวัติ</p>
        )}
        <div className="space-y-0">
          {[...sim.history].reverse().map((h, idx) => (
            <div key={h.id} className="flex gap-3 pb-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  idx === 0 ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <Clock size={12} className={idx === 0 ? 'text-white' : 'text-gray-500'} />
                </div>
                {idx < sim.history.length - 1 && (
                  <div className="w-0.5 bg-gray-100 flex-1 mt-1"></div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800">{h.action}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(h.date)}</p>
                </div>
                <div className="mt-1 space-y-0.5">
                  {h.holder && <p className="text-xs text-gray-500">ผู้ถือ: <span className="text-gray-700 font-medium">{h.holder}</span></p>}
                  {h.device && h.device !== '-' && <p className="text-xs text-gray-500">อุปกรณ์: <span className="text-gray-700">{h.device}</span></p>}
                  {h.whatsappAccount && <p className="text-xs text-gray-500">WhatsApp: <span className="text-blue-600 font-medium">{h.whatsappAccount}</span></p>}
                  {h.note && <p className="text-xs text-gray-400 italic">{h.note}</p>}
                  {h.by && <p className="text-xs text-gray-400">กรอกโดย: <span className="font-medium text-blue-600">{h.by}</span></p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">ลบซิมการ์ด?</h3>
            <p className="text-sm text-gray-500 mb-4">ต้องการลบซิม {sim.phoneNumber} ออกจากระบบ? ข้อมูลจะหายถาวร</p>
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
