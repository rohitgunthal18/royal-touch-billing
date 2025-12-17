import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Get all customers
router.get('/', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT * FROM customers ORDER BY created_at DESC
    `).all()
    res.json(customers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single customer
router.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }
    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create customer
router.post('/', (req, res) => {
  try {
    const { name, phone, email, address, gst_number, pan_number, notes } = req.body
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    const result = db.prepare(`
      INSERT INTO customers (name, phone, email, address, gst_number, pan_number, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, phone, email, address, gst_number, pan_number, notes)

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update customer
router.put('/:id', (req, res) => {
  try {
    const { name, phone, email, address, gst_number, pan_number, notes } = req.body
    
    db.prepare(`
      UPDATE customers SET
        name = ?, phone = ?, email = ?, address = ?,
        gst_number = ?, pan_number = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, phone, email, address, gst_number, pan_number, notes, req.params.id)

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id)
    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete customer
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id)
    res.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


