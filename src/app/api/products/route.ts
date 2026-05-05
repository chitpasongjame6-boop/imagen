import { NextRequest, NextResponse } from 'next/server'
import { getDb, withoutMongoId, withoutMongoIds } from '@/lib/mongodb'
import { jsonError } from '@/lib/server-auth'

export async function GET() {
  try {
    const db = await getDb()
    const products = await db.collection('products').find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(withoutMongoIds(products))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to load products')
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const doc = {
      id: body.id || `product-${Date.now()}`,
      name: body.name || '',
      description: body.description || '',
      price: Number(body.price ?? 0),
      createdAt: body.createdAt || new Date().toISOString(),
    }
    const db = await getDb()
    await db.collection('products').insertOne(doc)
    return NextResponse.json(withoutMongoId(doc))
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to create product')
  }
}
