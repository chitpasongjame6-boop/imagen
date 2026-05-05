import { NextRequest, NextResponse } from 'next/server'
import { getDb, withoutMongoId, withoutMongoIds } from '@/lib/mongodb'
import { jsonError, requireAuth } from '@/lib/server-auth'

function normalizeAgent(body: any) {
  return {
    ...body,
    holdPercentage: Number(body.holdPercentage ?? 25),
    debtAlertDays: Number(body.debtAlertDays ?? 7),
    debtAlertAmount: Number(body.debtAlertAmount ?? 5000),
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const db = await getDb()
    const agents = await db.collection('agents').find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(withoutMongoIds(agents))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load agents')
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const doc = normalizeAgent(await req.json())
    doc.createdAt = doc.createdAt || new Date().toISOString()
    const db = await getDb()
    await db.collection('agents').insertOne(doc)
    return NextResponse.json(withoutMongoId(doc))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to create agent')
  }
}
