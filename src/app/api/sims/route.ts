import { NextRequest, NextResponse } from 'next/server'
import { getDb, withoutMongoId, withoutMongoIds } from '@/lib/mongodb'
import { jsonError, requireAuth } from '@/lib/server-auth'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const db = await getDb()
    const sims = await db.collection('sims').find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(withoutMongoIds(sims))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load sims')
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const body = await req.json()
    const doc = {
      ...body,
      history: body.history || [],
      createdAt: body.createdAt || new Date().toISOString(),
    }
    const db = await getDb()
    await db.collection('sims').insertOne(doc)
    return NextResponse.json(withoutMongoId(doc))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to create sim')
  }
}
