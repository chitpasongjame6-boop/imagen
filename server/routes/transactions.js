import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function toTx(t) {
  return {
    id: t.id, agentId: t.agent_id, date: t.date,
    creditAmount: Number(t.credit_amount),
    holdPercentage: Number(t.hold_percentage),
    amountDue: Number(t.amount_due),
    paymentStatus: t.payment_status,
    paidAmount: Number(t.paid_amount),
    note: t.note, createdBy: t.created_by,
    createdAt: t.created_at,
  }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC')
    res.json(result.rows.map(toTx))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { id, agentId, date, creditAmount, holdPercentage, amountDue, paymentStatus, paidAmount, note, createdBy } = req.body
    await pool.query(
      `INSERT INTO transactions (id, agent_id, date, credit_amount, hold_percentage, amount_due, payment_status, paid_amount, note, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, agentId, date, creditAmount, holdPercentage, amountDue, paymentStatus, paidAmount, note, createdBy]
    )
    const result = await pool.query('SELECT * FROM transactions WHERE id=$1', [id])
    res.json(toTx(result.rows[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { agentId, date, creditAmount, holdPercentage, amountDue, paymentStatus, paidAmount, note, createdBy } = req.body
    await pool.query(
      `UPDATE transactions SET agent_id=$1, date=$2, credit_amount=$3, hold_percentage=$4, amount_due=$5, payment_status=$6, paid_amount=$7, note=$8, created_by=$9 WHERE id=$10`,
      [agentId, date, creditAmount, holdPercentage, amountDue, paymentStatus, paidAmount, note, createdBy, req.params.id]
    )
    const result = await pool.query('SELECT * FROM transactions WHERE id=$1', [req.params.id])
    res.json(toTx(result.rows[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
