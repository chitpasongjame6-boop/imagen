import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function toAgent(a) {
  return {
    id: a.id, ownerName: a.owner_name, shopName: a.shop_name,
    holdPercentage: Number(a.hold_percentage),
    debtAlertDays: Number(a.debt_alert_days),
    debtAlertAmount: Number(a.debt_alert_amount),
    createdBy: a.created_by, createdAt: a.created_at,
  }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM agents ORDER BY created_at DESC')
    res.json(result.rows.map(toAgent))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { id, ownerName, shopName, holdPercentage, debtAlertDays, debtAlertAmount, createdBy, createdAt } = req.body
    await pool.query(
      `INSERT INTO agents (id, owner_name, shop_name, hold_percentage, debt_alert_days, debt_alert_amount, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, ownerName, shopName, holdPercentage, debtAlertDays, debtAlertAmount, createdBy, createdAt]
    )
    const result = await pool.query('SELECT * FROM agents WHERE id=$1', [id])
    res.json(toAgent(result.rows[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { ownerName, shopName, holdPercentage, debtAlertDays, debtAlertAmount } = req.body
    await pool.query(
      `UPDATE agents SET owner_name=$1, shop_name=$2, hold_percentage=$3, debt_alert_days=$4, debt_alert_amount=$5 WHERE id=$6`,
      [ownerName, shopName, holdPercentage, debtAlertDays, debtAlertAmount, req.params.id]
    )
    const result = await pool.query('SELECT * FROM agents WHERE id=$1', [req.params.id])
    res.json(toAgent(result.rows[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM agents WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
