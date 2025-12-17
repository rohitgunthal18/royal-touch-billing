import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Get all invoices
router.get('/', (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT * FROM invoices ORDER BY created_at DESC
    `).all()
    res.json(invoices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single invoice with items
router.get('/:id', (req, res) => {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id)
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(req.params.id)
    invoice.items = items

    res.json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create invoice
router.post('/', (req, res) => {
  try {
    const {
      invoice_number, invoice_date, due_date, customer_id, customer_name, customer_phone, customer_address,
      customer_gst, state_of_supply, items, subtotal, discount_amount, tax_amount, round_off, total_amount,
      amount_paid, balance_due, payment_method, payment_status, notes, description
    } = req.body

    if (!invoice_number || !invoice_date) {
      return res.status(400).json({ message: 'Invoice number and date are required' })
    }

    // Check for duplicate invoice number
    const existing = db.prepare('SELECT id FROM invoices WHERE invoice_number = ?').get(invoice_number)
    if (existing) {
      return res.status(400).json({ message: 'Invoice number already exists' })
    }

    // Start transaction
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (
        invoice_number, invoice_date, customer_id, customer_name, customer_phone, customer_address,
        subtotal, discount, discount_type, cgst, sgst, igst, total_amount,
        payment_method, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (
        invoice_id, product_id, product_name, hsn_code, category, metal_type, purity,
        weight, quantity, unit_price, making_charges, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const updateStock = db.prepare(`
      UPDATE products SET stock = stock - ? WHERE id = ?
    `)

    const transaction = db.transaction(() => {
      const result = insertInvoice.run(
        invoice_number, invoice_date, customer_id || null, customer_name, customer_phone, customer_address,
        subtotal, discount_amount || 0, 'amount', tax_amount / 2, tax_amount / 2, 0, total_amount,
        payment_method, payment_status, notes || description
      )

      const invoiceId = result.lastInsertRowid

      // Insert items and update stock
      if (items && items.length > 0) {
        for (const item of items) {
          insertItem.run(
            invoiceId, item.product_id || null, item.product_name, item.hsn_code || '7113',
            item.category || '', item.metal_type || '', item.purity || '', item.weight || 0,
            item.quantity || 1, item.unit_price || 0, item.making_charges || 0, item.total || 0
          )

          // Update stock if product exists
          if (item.product_id) {
            updateStock.run(item.quantity || 1, item.product_id)
          }
        }
      }

      // Update customer total purchases
      if (customer_id) {
        db.prepare(`
          UPDATE customers SET
            total_purchases = total_purchases + ?,
            outstanding = CASE WHEN ? = 'pending' THEN outstanding + ? ELSE outstanding END
          WHERE id = ?
        `).run(total_amount, payment_status, total_amount, customer_id)
      }

      return invoiceId
    })

    const invoiceId = transaction()
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
    invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId)

    res.status(201).json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update invoice
router.put('/:id', (req, res) => {
  try {
    const {
      invoice_number, invoice_date, customer_id, customer_name, customer_phone, customer_address,
      items, subtotal, discount, discount_type, cgst, sgst, igst, total_amount,
      payment_method, payment_status, notes
    } = req.body

    // Check for duplicate invoice number
    const existing = db.prepare('SELECT id FROM invoices WHERE invoice_number = ? AND id != ?').get(invoice_number, req.params.id)
    if (existing) {
      return res.status(400).json({ message: 'Invoice number already exists' })
    }

    const transaction = db.transaction(() => {
      // Delete old items (stock will need manual adjustment)
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(req.params.id)

      // Update invoice
      db.prepare(`
        UPDATE invoices SET
          invoice_number = ?, invoice_date = ?, customer_id = ?, customer_name = ?,
          customer_phone = ?, customer_address = ?, subtotal = ?, discount = ?,
          discount_type = ?, cgst = ?, sgst = ?, igst = ?, total_amount = ?,
          payment_method = ?, payment_status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        invoice_number, invoice_date, customer_id || null, customer_name,
        customer_phone, customer_address, subtotal, discount,
        discount_type, cgst, sgst, igst || 0, total_amount,
        payment_method, payment_status, notes, req.params.id
      )

      // Insert new items
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, product_id, product_name, hsn_code, category, metal_type, purity,
          weight, quantity, unit_price, making_charges, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      if (items && items.length > 0) {
        for (const item of items) {
          insertItem.run(
            req.params.id, item.product_id || null, item.product_name, item.hsn_code,
            item.category, item.metal_type, item.purity, item.weight,
            item.quantity, item.unit_price, item.making_charges || 0, item.total
          )
        }
      }
    })

    transaction()

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id)
    invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(req.params.id)

    res.json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete invoice
router.delete('/:id', (req, res) => {
  try {
    // Items will be deleted automatically due to ON DELETE CASCADE
    db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id)
    res.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


