'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import TransactionList from '@/features/transactions/TransactionList'

export default function Page() {
  return (
    <ProtectedPage>
      <TransactionList />
    </ProtectedPage>
  )
}
