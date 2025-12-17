import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Get all suppliers
router.get('/', (req, res) => {
  try {
    const suppliers = db.prepare(`
      SELECT * FROM suppliers ORDER BY created_at DESC
    `).all()
    res.json(suppliers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single supplier
router.get('/:id', (req, res) => {
  try {
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    res.json(supplier)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create supplier
router.post('/', (req, res) => {
  try {
    const { name, company_name, phone, email, address, gst_number, bank_details, notes } = req.body
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    const result = db.prepare(`
      INSERT INTO suppliers (name, company_name, phone, email, address, gst_number, bank_details, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, company_name, phone, email, address, gst_number, bank_details, notes)

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(supplier)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update supplier
router.put('/:id', (req, res) => {
  try {
    const { name, company_name, phone, email, address, gst_number, bank_details, notes } = req.body
    
    db.prepare(`
      UPDATE suppliers SET
        name = ?, company_name = ?, phone = ?, email = ?, address = ?,
        gst_number = ?, bank_details = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, company_name, phone, email, address, gst_number, bank_details, notes, req.params.id)

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id)
    res.json(supplier)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete supplier
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id)
    res.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


