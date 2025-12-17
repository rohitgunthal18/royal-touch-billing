import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Get all expenses
router.get('/', (req, res) => {
  try {
    const expenses = db.prepare(`
      SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC
    `).all()
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single expense
router.get('/:id', (req, res) => {
  try {
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id)
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' })
    }
    res.json(expense)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create expense
router.post('/', (req, res) => {
  try {
    const { category, description, amount, expense_date, payment_method, reference, notes } = req.body
    
    if (!category || !amount || !expense_date) {
      return res.status(400).json({ message: 'Category, amount, and date are required' })
    }

    const result = db.prepare(`
      INSERT INTO expenses (category, description, amount, expense_date, payment_method, reference, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(category, description, amount, expense_date, payment_method, reference, notes)

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(expense)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update expense
router.put('/:id', (req, res) => {
  try {
    const { category, description, amount, expense_date, payment_method, reference, notes } = req.body
    
    db.prepare(`
      UPDATE expenses SET
        category = ?, description = ?, amount = ?, expense_date = ?,
        payment_method = ?, reference = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(category, description, amount, expense_date, payment_method, reference, notes, req.params.id)

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id)
    res.json(expense)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete expense
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id)
    res.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


