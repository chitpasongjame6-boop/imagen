import bcrypt from 'bcryptjs'
import { Db, MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

type MongoCache = {
  client?: MongoClient
  db?: Db
  indexesReady?: boolean
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoCache?: MongoCache
}

const cache = globalForMongo.mongoCache ?? {}
globalForMongo.mongoCache = cache

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured')
  }

  if (!cache.client) {
    cache.client = new MongoClient(uri)
    await cache.client.connect()
    cache.db = cache.client.db()
  }

  if (!cache.db) {
    cache.db = cache.client.db()
  }

  if (!cache.indexesReady) {
    await ensureDatabase(cache.db)
    cache.indexesReady = true
  }

  return cache.db
}

export function withoutMongoId<T extends Record<string, unknown>>(doc: T | null) {
  if (!doc) return null
  const rest = { ...doc }
  delete rest._id
  return rest
}

export function withoutMongoIds<T extends Record<string, unknown>>(docs: T[]) {
  return docs.map((doc) => withoutMongoId(doc))
}

async function ensureDatabase(db: Db) {
  await Promise.all([
    ensureUniqueIdIndex(db, 'staff'),
    ensureUniqueIdIndex(db, 'sims'),
    ensureUniqueIdIndex(db, 'agents'),
    ensureUniqueIdIndex(db, 'transactions'),
    ensureUniqueIdIndex(db, 'products'),
  ])

  const admin = await db.collection('staff').findOne({ id: 'staff-admin' })
  if (!admin) {
    const pinHash = await bcrypt.hash('0000', 10)
    await db.collection('staff').insertOne({
      id: 'staff-admin',
      name: 'Admin',
      pinHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    })
  }
}

async function ensureUniqueIdIndex(db: Db, collectionName: string) {
  try {
    await db.collection(collectionName).createIndex({ id: 1 }, { unique: true })
  } catch (err) {
    if (isExistingCompatibleIndex(err)) return
    throw err
  }
}

function isExistingCompatibleIndex(err: unknown) {
  if (!(err instanceof Error)) return false
  return err.message.includes('An existing index has the same name')
    && err.message.includes('key: { id: 1 }')
    && err.message.includes('unique: true')
}
