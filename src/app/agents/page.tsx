'use client'

import ProtectedPage from '@/components/shared/ProtectedPage'
import AgentList from '@/features/agents/AgentList'

export default function Page() {
  return (
    <ProtectedPage>
      <AgentList />
    </ProtectedPage>
  )
}
