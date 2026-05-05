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

export async function GET() {
  try {
    const db = await getDb()
    const staff = await db.collection('staff').find({}).sort({ createdAt: 1 }).toArray()
    return NextResponse.json(staff.map(toStaff))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load staff')
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req)
  if (auth.response) return auth.response

  try {
    const { id, name, pin, role } = await req.json()
    if (!id || !name || !pin) return jsonError('Missing staff data', 400)

    const db = await getDb()
    const pinHash = await bcrypt.hash(String(pin), 10)
    const doc = {
      id,
      name,
      pinHash,
      role: role || 'staff',
      createdAt: new Date().toISOString(),
    }
    await db.collection('staff').insertOne(doc)
    return NextResponse.json(toStaff(doc))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to create staff')
  }
}
