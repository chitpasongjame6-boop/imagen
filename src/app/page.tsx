'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import Dashboard from '@/features/dashboard/Dashboard'

export default function Page() {
  return (
    <ProtectedPage>
      <Dashboard />
    </ProtectedPage>
  )
}
