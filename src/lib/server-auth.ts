import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export type AuthUser = {
  id: string
  name: string
  role: string
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function getAuthUser(req: NextRequest): AuthUser | null {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null

  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET || 'simagent-secret') as AuthUser
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return { response: jsonError('Unauthorized', 401), user: null }
  return { response: null, user }
}

export function requireAdmin(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth.response) return auth
  if (auth.user?.role !== 'admin') {
    return { response: jsonError('Admin only', 403), user: auth.user }
  }
  return auth
}
