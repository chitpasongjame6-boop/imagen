import { NextRequest, NextResponse } from 'next/server'
import { getDb, withoutMongoId } from '@/lib/mongodb'
import { jsonError, requireAuth } from '@/lib/server-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const db = await getDb()
    const sim = await db.collection('sims').findOne({ id })
    if (!sim) return jsonError('Not found', 404)
    return NextResponse.json(withoutMongoId(sim))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load sim')
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const body = await req.json()
    const update = { ...body }
    delete update._id
    const db = await getDb()
    const sim = await db.collection('sims').findOneAndUpdate(
      { id },
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!sim) return jsonError('Not found', 404)
    return NextResponse.json(withoutMongoId(sim))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to update sim')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const db = await getDb()
    await db.collection('sims').deleteOne({ id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to delete sim')
  }
}
