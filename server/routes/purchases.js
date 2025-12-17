import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Get all purchases
router.get('/', (req, res) => {
  try {
    const purchases = db.prepare(`
      SELECT * FROM purchases ORDER BY created_at DESC
    `).all()
    res.json(purchases)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single purchase with items
router.get('/:id', (req, res) => {
  try {
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(req.params.id)
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' })
    }

    const items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(req.params.id)
    purchase.items = items

    res.json(purchase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create purchase
router.post('/', (req, res) => {
  try {
    const {
      purchase_number, purchase_date, supplier_id, supplier_name,
      items, subtotal, tax, total_amount, payment_method, payment_status, notes
    } = req.body

    if (!purchase_number || !purchase_date) {
      return res.status(400).json({ message: 'Purchase number and date are required' })
    }

    // Check for duplicate purchase number
    const existing = db.prepare('SELECT id FROM purchases WHERE purchase_number = ?').get(purchase_number)
    if (existing) {
      return res.status(400).json({ message: 'Purchase number already exists' })
    }

    const insertPurchase = db.prepare(`
      INSERT INTO purchases (
        purchase_number, purchase_date, supplier_id, supplier_name,
        subtotal, tax, total_amount, payment_method, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertItem = db.prepare(`
      INSERT INTO purchase_items (purchase_id, product_name, weight, quantity, unit_price, total)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      const result = insertPurchase.run(
        purchase_number, purchase_date, supplier_id || null, supplier_name,
        subtotal, tax, total_amount, payment_method, payment_status, notes
      )

      const purchaseId = result.lastInsertRowid

      if (items && items.length > 0) {
        for (const item of items) {
          insertItem.run(
            purchaseId, item.product_name, item.weight, item.quantity, item.unit_price, item.total
          )
        }
      }

      // Update supplier total purchases
      if (supplier_id) {
        db.prepare(`
          UPDATE suppliers SET
            total_purchases = total_purchases + ?,
            outstanding = CASE WHEN ? = 'pending' THEN outstanding + ? ELSE outstanding END
          WHERE id = ?
        `).run(total_amount, payment_status, total_amount, supplier_id)
      }

      return purchaseId
    })

    const purchaseId = transaction()
    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(purchaseId)
    purchase.items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(purchaseId)

    res.status(201).json(purchase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update purchase
router.put('/:id', (req, res) => {
  try {
    const {
      purchase_number, purchase_date, supplier_id, supplier_name,
      items, subtotal, tax, total_amount, payment_method, payment_status, notes
    } = req.body

    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM purchase_items WHERE purchase_id = ?').run(req.params.id)

      db.prepare(`
        UPDATE purchases SET
          purchase_number = ?, purchase_date = ?, supplier_id = ?, supplier_name = ?,
          subtotal = ?, tax = ?, total_amount = ?, payment_method = ?,
          payment_status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        purchase_number, purchase_date, supplier_id || null, supplier_name,
        subtotal, tax, total_amount, payment_method, payment_status, notes, req.params.id
      )

      const insertItem = db.prepare(`
        INSERT INTO purchase_items (purchase_id, product_name, weight, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      if (items && items.length > 0) {
        for (const item of items) {
          insertItem.run(
            req.params.id, item.product_name, item.weight, item.quantity, item.unit_price, item.total
          )
        }
      }
    })

    transaction()

    const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(req.params.id)
    purchase.items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(req.params.id)

    res.json(purchase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete purchase
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM purchases WHERE id = ?').run(req.params.id)
    res.json({ message: 'Purchase deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


