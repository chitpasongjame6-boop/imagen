import { NextRequest, NextResponse } from 'next/server'
import { getDb, withoutMongoId } from '@/lib/mongodb'
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const db = await getDb()
    const tx = await db.collection('transactions').findOne({ id })
    if (!tx) return jsonError('Not found', 404)
    return NextResponse.json(withoutMongoId(tx))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load transaction')
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const update = normalizeTransaction(await req.json())
    delete update._id
    const db = await getDb()
    const tx = await db.collection('transactions').findOneAndUpdate(
      { id },
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!tx) return jsonError('Not found', 404)
    return NextResponse.json(withoutMongoId(tx))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to update transaction')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const db = await getDb()
    await db.collection('transactions').deleteOne({ id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to delete transaction')
  }
}
