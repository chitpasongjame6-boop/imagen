import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

async function getSimWithHistory(id) {
  const simRes = await pool.query('SELECT * FROM sims WHERE id=$1', [id])
  if (simRes.rows.length === 0) return null
  const histRes = await pool.query('SELECT * FROM sim_history WHERE sim_id=$1 ORDER BY date', [id])
  const s = simRes.rows[0]
  return {
    id: s.id, phoneNumber: s.phone_number, serialNumber: s.serial_number,
    whatsappAccount: s.whatsapp_account, holder: s.holder, device: s.device,
    imageUrl: s.image_url, registrar: s.registrar, status: s.status,
    createdBy: s.created_by, createdAt: s.created_at,
    history: histRes.rows.map(h => ({
      id: h.id, date: h.date, action: h.action, holder: h.holder,
      device: h.device, whatsappAccount: h.whatsapp_account, note: h.note, by: h.by_staff,
    })),
  }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sims ORDER BY created_at DESC')
    const sims = await Promise.all(result.rows.map(s => getSimWithHistory(s.id)))
    res.json(sims)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { id, phoneNumber, serialNumber, whatsappAccount, holder, device, imageUrl, registrar, status, createdBy, createdAt, history } = req.body
    await pool.query(
      `INSERT INTO sims (id, phone_number, serial_number, whatsapp_account, holder, device, image_url, registrar, status, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, phoneNumber, serialNumber, whatsappAccount, holder, device, imageUrl, registrar, status, createdBy, createdAt]
    )
    for (const h of (history || [])) {
      await pool.query(
        `INSERT INTO sim_history (id, sim_id, date, action, holder, device, whatsapp_account, note, by_staff)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [h.id, id, h.date, h.action, h.holder, h.device, h.whatsappAccount, h.note, h.by]
      )
    }
    const sim = await getSimWithHistory(id)
    res.json(sim)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const sim = await getSimWithHistory(req.params.id)
    if (!sim) return res.status(404).json({ error: 'Not found' })
    res.json(sim)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { phoneNumber, serialNumber, whatsappAccount, holder, device, imageUrl, registrar, status, history } = req.body
    await pool.query(
      `UPDATE sims SET phone_number=$1, serial_number=$2, whatsapp_account=$3, holder=$4, device=$5, image_url=$6, registrar=$7, status=$8 WHERE id=$9`,
      [phoneNumber, serialNumber, whatsappAccount, holder, device, imageUrl, registrar, status, req.params.id]
    )
    if (history) {
      await pool.query('DELETE FROM sim_history WHERE sim_id=$1', [req.params.id])
      for (const h of history) {
        await pool.query(
          `INSERT INTO sim_history (id, sim_id, date, action, holder, device, whatsapp_account, note, by_staff)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [h.id, req.params.id, h.date, h.action, h.holder, h.device, h.whatsappAccount, h.note, h.by]
        )
      }
    }
    const sim = await getSimWithHistory(req.params.id)
    res.json(sim)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM sims WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
