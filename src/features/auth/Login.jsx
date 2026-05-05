import React, { useState, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { Lock, User, Eye, EyeOff, ChevronLeft, Loader } from 'lucide-react'
import { useApp } from '@/features/app/AppContext'
import { useAuth } from '@/features/auth/AuthContext'

export default function Login() {
  const { reload } = useApp()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [step, setStep] = useState('select')
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/staff')
      .then(r => r.json())
      .then(data => { setStaff(Array.isArray(data) ? data : []); setStaffLoading(false) })
      .catch(() => setStaffLoading(false))
  }, [])

  function handleSelectStaff(s) {
    setSelectedStaff(s)
    setPin('')
    setError('')
    setStep('pin')
  }

  function handlePinInput(digit) {
    if (pin.length >= 6 || submitting) return
    const newPin = pin + digit
    setPin(newPin)
    if (newPin.length === 4) setTimeout(() => doLogin(newPin), 100)
  }

  function handlePinDelete() {
    setPin((p) => p.slice(0, -1))
    setError('')
  }

  async function doLogin(enteredPin) {
    if (submitting) return
    setSubmitting(true)
    try {
      await login(selectedStaff.id, enteredPin)
      await reload()
      navigate('/', { replace: true })
    } catch {
      setShake(true)
      setError('PIN ไม่ถูกต้อง')
      setPin('')
      setTimeout(() => { setShake(false); setSubmitting(false) }, 600)
    }
  }

  function handleSubmitPin(e) {
    e.preventDefault()
    if (pin.length === 0) return
    doLogin(pin)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">SA</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SimAgent</h1>
          <p className="text-blue-200 text-sm mt-1">ระบบจัดการซิม & เอเย่นต์</p>
        </div>

        {step === 'select' && (
          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-800">เลือกบัญชีผู้ใช้</h2>
            </div>
            {staffLoading && (
              <div className="flex justify-center py-6">
                <Loader size={20} className="text-blue-400 animate-spin" />
              </div>
            )}
            {!staffLoading && staff.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</p>
            )}
            <div className="space-y-2">
              {staff.map((s) => (
                <button
                  key={s.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-95"
                  onClick={() => handleSelectStaff(s)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    s.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงาน'}</p>
                  </div>
                  <ChevronLeft size={16} className="text-gray-300 rotate-180" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'pin' && selectedStaff && (
          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <button
              className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-gray-600"
              onClick={() => { setStep('select'); setPin(''); setError('') }}
            >
              <ChevronLeft size={16} /> เปลี่ยนบัญชี
            </button>

            <div className="text-center mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3 ${
                selectedStaff.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {selectedStaff.name.charAt(0)}
              </div>
              <p className="font-bold text-gray-800">{selectedStaff.name}</p>
              <p className="text-xs text-gray-400">{selectedStaff.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงาน'}</p>
            </div>

            <div className="flex items-center gap-2 mb-1 justify-center">
              <Lock size={14} className="text-gray-400" />
              <p className="text-sm text-gray-500">กรอก PIN</p>
            </div>

            <form onSubmit={handleSubmitPin}>
              <div className="relative mb-2">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  className={`input-field text-center text-xl tracking-widest font-bold pr-10 transition-all ${
                    shake ? 'border-red-400 bg-red-50' : ''
                  }`}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setPin(v)
                    setError('')
                  }}
                  autoFocus
                  maxLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPin((v) => !v)}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-500 text-center mb-3">{error}</p>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                  k === '' ? <div key={i} /> :
                  k === '⌫' ? (
                    <button
                      key={i}
                      type="button"
                      className="h-14 rounded-xl bg-gray-100 text-gray-600 font-semibold text-lg active:bg-gray-200 transition-colors flex items-center justify-center"
                      onClick={handlePinDelete}
                    >
                      ⌫
                    </button>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      className="h-14 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 font-bold text-xl active:bg-blue-50 active:border-blue-300 transition-colors"
                      onClick={() => handlePinInput(k)}
                    >
                      {k}
                    </button>
                  )
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center mt-4 py-3 text-base"
                disabled={pin.length === 0}
              >
                เข้าสู่ระบบ
              </button>
            </form>
          </div>
        )}

        <p className="text-blue-300 text-xs text-center mt-6">
          บัญชีเริ่มต้น: แอดมิน (PIN: 0000)
        </p>
      </div>
    </div>
  )
}
