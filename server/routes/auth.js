import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { staffId, pin } = req.body
    if (!staffId || !pin) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' })

    const result = await pool.query('SELECT * FROM staff WHERE id = $1', [staffId])
    if (result.rows.length === 0) return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้' })

    const staff = result.rows[0]
    const valid = await bcrypt.compare(String(pin), staff.pin_hash)
    if (!valid) return res.status(401).json({ error: 'PIN ไม่ถูกต้อง' })

    const token = jwt.sign(
      { id: staff.id, name: staff.name, role: staff.role },
      process.env.JWT_SECRET || 'simagent-secret',
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: staff.id, name: staff.name, role: staff.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
