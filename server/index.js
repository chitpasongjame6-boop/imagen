import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createReadStream, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pool from './db.js'
import { readFileSync } from 'fs'

import authRoutes from './routes/auth.js'
import staffRoutes from './routes/staff.js'
import simsRoutes from './routes/sims.js'
import agentsRoutes from './routes/agents.js'
import transactionsRoutes from './routes/transactions.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/sims', simsRoutes)
app.use('/api/agents', agentsRoutes)
app.use('/api/transactions', transactionsRoutes)

app.delete('/api/clear-all', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions')
    await pool.query('DELETE FROM sim_history')
    await pool.query('DELETE FROM sims')
    await pool.query('DELETE FROM agents')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const distPath = join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

async function migrate() {
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
    await pool.query(schema)
    console.log('✓ Database schema ready')

    const adminCheck = await pool.query("SELECT id FROM staff WHERE id='staff-admin'")
    if (adminCheck.rows.length === 0) {
      const bcrypt = await import('bcryptjs')
      const hash = await bcrypt.default.hash('0000', 10)
      await pool.query(
        "INSERT INTO staff (id, name, pin_hash, role) VALUES ('staff-admin', 'แอดมิน', $1, 'admin')",
        [hash]
      )
      console.log('✓ Admin account created (PIN: 0000)')
    }
  } catch (err) {
    console.error('Migration error:', err.message)
  }
}

migrate().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`)
  })
})
