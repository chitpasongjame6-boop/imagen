import { NextRequest, NextResponse } from 'next/server'
import { getDb, withoutMongoId } from '@/lib/mongodb'
import { jsonError, requireAuth } from '@/lib/server-auth'

function normalizeAgent(body: any) {
  return {
    ...body,
    holdPercentage: Number(body.holdPercentage ?? 25),
    debtAlertDays: Number(body.debtAlertDays ?? 7),
    debtAlertAmount: Number(body.debtAlertAmount ?? 5000),
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const db = await getDb()
    const agent = await db.collection('agents').findOne({ id })
    if (!agent) return jsonError('Not found', 404)
    return NextResponse.json(withoutMongoId(agent))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load agent')
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const update = normalizeAgent(await req.json())
    delete update._id
    const db = await getDb()
    const agent = await db.collection('agents').findOneAndUpdate(
      { id },
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!agent) return jsonError('Not found', 404)
    return NextResponse.json(withoutMongoId(agent))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to update agent')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const db = await getDb()
    await db.collection('agents').deleteOne({ id })
    await db.collection('transactions').deleteMany({ agentId: id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to delete agent')
  }
}
