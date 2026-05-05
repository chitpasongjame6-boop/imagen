'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import SimDetail from '@/features/sims/SimDetail'

export default function Page() {
  return (
    <ProtectedPage>
      <SimDetail />
    </ProtectedPage>
  )
}
