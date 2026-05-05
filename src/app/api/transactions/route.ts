import { NextRequest, NextResponse } from 'next/server'
import { getDb, withoutMongoId, withoutMongoIds } from '@/lib/mongodb'
import { jsonError, requireAuth } from '@/lib/server-auth'

function normalizeTransaction(body: any) {
  return {
    ...body,
    creditAmount: Number(body.creditAmount ?? 0),
    holdPercentage: Number(body.holdPercentage ?? 0),
    amountDue: Number(body.amountDue ?? body.creditAmount ?? 0),
    paidAmount: Number(body.paidAmount ?? 0),
    paymentStatus: body.paymentStatus || 'unpaid',
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const db = await getDb()
    const transactions = await db.collection('transactions').find({}).sort({ date: -1 }).toArray()
    return NextResponse.json(withoutMongoIds(transactions))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load transactions')
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const doc = normalizeTransaction(await req.json())
    doc.createdAt = doc.createdAt || new Date().toISOString()
    const db = await getDb()
    await db.collection('transactions').insertOne(doc)
    return NextResponse.json(withoutMongoId(doc))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to create transaction')
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const db = await getDb()
    await db.collection('transactions').deleteMany({})
    return NextResponse.json({ ok: true })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to clear transactions')
  }
}
