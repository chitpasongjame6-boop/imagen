import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { jsonError, requireAuth } from '@/lib/server-auth'

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const db = await getDb()
    await Promise.all([
      db.collection('transactions').deleteMany({}),
      db.collection('sims').deleteMany({}),
      db.collection('agents').deleteMany({}),
    ])
    return NextResponse.json({ ok: true })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to clear data')
  }
}
