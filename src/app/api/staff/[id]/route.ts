import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { jsonError, requireAdmin } from '@/lib/server-auth'

function toStaff(doc: any) {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role,
    createdAt: doc.createdAt,
    pin: '****',
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    const { name, pin, role } = await req.json()
    const update: Record<string, unknown> = { name, role }
    if (pin && pin !== '****') update.pinHash = await bcrypt.hash(String(pin), 10)

    const db = await getDb()
    const result = await db.collection('staff').findOneAndUpdate(
      { id },
      { $set: update },
      { returnDocument: 'after' },
    )
    if (!result) return jsonError('Not found', 404)

    return NextResponse.json(toStaff(result))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to update staff')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  try {
    const { id } = await params
    if (id === 'staff-admin') return jsonError('Cannot delete the main admin account', 400)

    const db = await getDb()
    await db.collection('staff').deleteOne({ id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to delete staff')
  }
}
