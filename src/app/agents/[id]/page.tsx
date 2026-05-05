'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import AgentDetail from '@/features/agents/AgentDetail'

export default function Page() {
  return (
    <ProtectedPage>
      <AgentDetail />
    </ProtectedPage>
  )
}
