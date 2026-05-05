'use client'

import { useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { useApp } from '@/features/app/AppContext'
import { useAuth } from '@/features/auth/AuthContext'
import { useNavigate } from '@/lib/navigation'

function FullPageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )
}

export default function ProtectedPage({ children }) {
  const navigate = useNavigate()
  const { currentUser, authReady } = useAuth()
  const { loading } = useApp()

  useEffect(() => {
    if (authReady && !currentUser) {
      navigate('/login', { replace: true })
    }
  }, [authReady, currentUser, navigate])

  if (!authReady || !currentUser || loading) return <FullPageLoader />

  return <AppLayout>{children}</AppLayout>
}
