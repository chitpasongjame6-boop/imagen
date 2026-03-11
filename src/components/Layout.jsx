import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Smartphone, Users, FileText, BarChart2, UserCog, LogOut, ChevronDown, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'หน้าหลัก' },
  { to: '/sims', icon: Smartphone, label: 'ซิมการ์ด' },
  { to: '/agents', icon: Users, label: 'เอเย่นต์' },
  { to: '/transactions', icon: FileText, label: 'ธุรกรรม' },
  { to: '/reports', icon: BarChart2, label: 'รายงาน' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { dispatch } = useApp()
  const [showMenu, setShowMenu] = useState(false)
  const [clearStep, setClearStep] = useState(0) // 0=hidden, 1=confirm1, 2=confirm2

  function handleLogout() {
    setShowMenu(false)
    logout()
    navigate('/login', { replace: true })
  }

  function handleClearAll() {
    dispatch({ type: 'CLEAR_ALL_DATA' })
    setClearStep(0)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm leading-tight block">SimAgent</span>
              <span className="text-gray-400 text-xs leading-tight block">ระบบจัดการซิม & เอเย่นต์</span>
            </div>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 active:bg-gray-100 transition-colors"
              onClick={() => setShowMenu((v) => !v)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                currentUser?.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentUser?.name?.charAt(0) || '?'}
              </div>
              <span className="text-xs font-semibold text-gray-700 max-w-[80px] truncate">{currentUser?.name}</span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-44 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-800 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-gray-400">{currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงาน'}</p>
                  </div>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => { setShowMenu(false); navigate('/staff') }}
                  >
                    <UserCog size={15} className="text-gray-400" />
                    จัดการพนักงาน
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                      onClick={() => { setShowMenu(false); setClearStep(1) }}
                    >
                      <Trash2 size={15} className="text-red-400" />
                      ล้างข้อมูลทั้งหมด
                    </button>
                  )}
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} className="text-red-400" />
                    ออกจากระบบ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>

      {clearStep > 0 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            {clearStep === 1 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">ล้างข้อมูลทั้งหมด?</h3>
                    <p className="text-xs text-gray-500">ซิม / เอเย่นต์ / ธุรกรรม จะถูกลบหมด</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                  ข้อมูลที่ลบจะ<span className="font-bold text-red-600">ไม่สามารถกู้คืนได้</span> บัญชีพนักงานจะยังคงอยู่
                </p>
                <div className="flex gap-3">
                  <button className="btn-secondary flex-1 justify-center" onClick={() => setClearStep(0)}>ยกเลิก</button>
                  <button className="btn-danger flex-1 justify-center" onClick={() => setClearStep(2)}>ต่อไป</button>
                </div>
              </>
            )}
            {clearStep === 2 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-600">ยืนยันอีกครั้ง</h3>
                    <p className="text-xs text-gray-500">กดยืนยันเพื่อลบข้อมูลทั้งหมด</p>
                  </div>
                </div>
                <p className="text-sm text-center text-gray-600 mb-4">
                  แน่ใจ 100% ว่าต้องการล้างข้อมูล<br />
                  <span className="font-bold text-red-600">ซิมการ์ด · เอเย่นต์ · ธุรกรรม?</span>
                </p>
                <div className="flex gap-3">
                  <button className="btn-secondary flex-1 justify-center" onClick={() => setClearStep(0)}>ยกเลิก</button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                    onClick={handleClearAll}
                  >
                    <Trash2 size={15} /> ลบทั้งหมด
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-bottom">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={`nav-item flex-1 ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
