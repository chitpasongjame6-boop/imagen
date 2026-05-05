'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import SimForm from '@/features/sims/SimForm'

export default function Page() {
  return (
    <ProtectedPage>
      <SimForm />
    </ProtectedPage>
  )
}
