import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Get all products
router.get('/', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products ORDER BY created_at DESC
    `).all()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create product
router.post('/', (req, res) => {
  try {
    const {
      name, sku, hsn_code, category, metal_type, purity,
      weight, stock, cost_price, selling_price, making_charges, min_stock, description
    } = req.body
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    // Check for duplicate SKU
    if (sku) {
      const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku)
      if (existing) {
        return res.status(400).json({ message: 'SKU already exists' })
      }
    }

    const result = db.prepare(`
      INSERT INTO products (name, sku, hsn_code, category, metal_type, purity, weight, stock, cost_price, selling_price, making_charges, min_stock, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, sku || null, hsn_code, category, metal_type, purity, weight, stock, cost_price, selling_price, making_charges, min_stock, description)

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update product
router.put('/:id', (req, res) => {
  try {
    const {
      name, sku, hsn_code, category, metal_type, purity,
      weight, stock, cost_price, selling_price, making_charges, min_stock, description
    } = req.body
    
    // Check for duplicate SKU
    if (sku) {
      const existing = db.prepare('SELECT id FROM products WHERE sku = ? AND id != ?').get(sku, req.params.id)
      if (existing) {
        return res.status(400).json({ message: 'SKU already exists' })
      }
    }

    db.prepare(`
      UPDATE products SET
        name = ?, sku = ?, hsn_code = ?, category = ?, metal_type = ?, purity = ?,
        weight = ?, stock = ?, cost_price = ?, selling_price = ?, making_charges = ?,
        min_stock = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, sku || null, hsn_code, category, metal_type, purity, weight, stock, cost_price, selling_price, making_charges, min_stock, description, req.params.id)

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete product
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


