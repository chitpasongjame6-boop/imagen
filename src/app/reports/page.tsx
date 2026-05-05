'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import Reports from '@/features/reports/Reports'

export default function Page() {
  return (
    <ProtectedPage>
      <Reports />
    </ProtectedPage>
  )
}
