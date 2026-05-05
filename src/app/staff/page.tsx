'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import StaffList from '@/features/staff/StaffList'

export default function Page() {
  return (
    <ProtectedPage>
      <StaffList />
    </ProtectedPage>
  )
}
