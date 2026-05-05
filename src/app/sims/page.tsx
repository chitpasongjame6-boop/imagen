'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import SimList from '@/features/sims/SimList'

export default function Page() {
  return (
    <ProtectedPage>
      <SimList />
    </ProtectedPage>
  )
}
