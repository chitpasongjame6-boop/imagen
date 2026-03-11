import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, role, created_at FROM staff ORDER BY created_at')
    res.json(result.rows.map(s => ({
      id: s.id, name: s.name, role: s.role,
      createdAt: s.created_at,
      pin: '****',
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id, name, pin, role } = req.body
    const pinHash = await bcrypt.hash(String(pin), 10)
    await pool.query(
      'INSERT INTO staff (id, name, pin_hash, role) VALUES ($1, $2, $3, $4)',
      [id, name, pinHash, role || 'staff']
    )
    res.json({ id, name, role: role || 'staff', pin: '****', createdAt: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, pin, role } = req.body
    if (pin) {
      const pinHash = await bcrypt.hash(String(pin), 10)
      await pool.query('UPDATE staff SET name=$1, pin_hash=$2, role=$3 WHERE id=$4', [name, pinHash, role, req.params.id])
    } else {
      await pool.query('UPDATE staff SET name=$1, role=$2 WHERE id=$3', [name, role, req.params.id])
    }
    const result = await pool.query('SELECT id, name, role, created_at FROM staff WHERE id=$1', [req.params.id])
    const s = result.rows[0]
    res.json({ id: s.id, name: s.name, role: s.role, pin: '****', createdAt: s.created_at })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (req.params.id === 'staff-admin') return res.status(400).json({ error: 'ไม่สามารถลบ admin หลักได้' })
    await pool.query('DELETE FROM staff WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
