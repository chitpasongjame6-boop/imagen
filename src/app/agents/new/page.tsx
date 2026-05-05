'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import AgentForm from '@/features/agents/AgentForm'

export default function Page() {
  return (
    <ProtectedPage>
      <AgentForm />
    </ProtectedPage>
  )
}
