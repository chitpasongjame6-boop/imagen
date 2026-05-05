'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import TransactionForm from '@/features/transactions/TransactionForm'

export default function Page() {
  return (
    <ProtectedPage>
      <TransactionForm />
    </ProtectedPage>
  )
}
