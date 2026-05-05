import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { jsonError } from '@/lib/server-auth'

export async function POST(req: NextRequest) {
  try {
    const { staffId, pin } = await req.json()
    if (!staffId || !pin) return jsonError('Missing staffId or pin', 400)

    const db = await getDb()
    const staff = await db.collection('staff').findOne({ id: staffId })
    if (!staff) return jsonError('User not found', 401)

    const valid = await bcrypt.compare(String(pin), staff.pinHash)
    if (!valid) return jsonError('Invalid PIN', 401)

    const user = { id: staff.id, name: staff.name, role: staff.role }
    const token = jwt.sign(user, process.env.JWT_SECRET || 'simagent-secret', { expiresIn: '7d' })

    return NextResponse.json({ token, user })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Login failed')
  }
}
