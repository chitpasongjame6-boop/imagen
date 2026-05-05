'use client'

import { AppProvider } from '@/features/app/AppContext'
import { AuthProvider } from '@/features/auth/AuthContext'

export default function Providers({ children }) {
  return (
    <AppProvider>
      <AuthProvider>{children}</AuthProvider>
    </AppProvider>
  )
}
