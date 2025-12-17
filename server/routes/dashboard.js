import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const thisMonthStart = thisMonth.toISOString().split('T')[0]
    
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    lastMonth.setDate(1)
    const lastMonthStart = lastMonth.toISOString().split('T')[0]
    const lastMonthEnd = new Date(thisMonth - 1).toISOString().split('T')[0]

    // Total sales
    const totalSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
    `).get().total

    // This month sales
    const thisMonthSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
      WHERE invoice_date >= ?
    `).get(thisMonthStart).total

    // Last month sales
    const lastMonthSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
      WHERE invoice_date >= ? AND invoice_date <= ?
    `).get(lastMonthStart, lastMonthEnd).total

    // Sales change percentage
    const salesChange = lastMonthSales > 0 
      ? Math.round(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100)
      : 0

    // Total customers
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count

    // New customers this month
    const newCustomersThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM customers WHERE created_at >= ?
    `).get(thisMonthStart).count

    // Last month customers
    const lastMonthCustomers = db.prepare(`
      SELECT COUNT(*) as count FROM customers WHERE created_at >= ? AND created_at <= ?
    `).get(lastMonthStart, lastMonthEnd).count

    const customersChange = lastMonthCustomers > 0
      ? Math.round(((newCustomersThisMonth - lastMonthCustomers) / lastMonthCustomers) * 100)
      : 0

    // Total products
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock > 0').get().count

    // Pending payments
    const pendingPayments = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE payment_status = 'pending'
    `).get().total

    // Low stock count
    const lowStockCount = db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE stock <= min_stock
    `).get().count

    // Today's collection
    const todayCollection = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
      WHERE invoice_date = ? AND payment_status = 'paid'
    `).get(today).total

    // Today's invoices count
    const todayInvoices = db.prepare(`
      SELECT COUNT(*) as count FROM invoices WHERE invoice_date = ?
    `).get(today).count

    // Gold rate from settings
    const settings = db.prepare('SELECT gold_rate_22k FROM settings WHERE id = 1').get()

    res.json({
      totalSales,
      totalCustomers,
      totalProducts,
      pendingPayments,
      salesChange,
      customersChange,
      lowStockCount,
      todayCollection,
      todayInvoices,
      goldRate: settings?.gold_rate_22k || 6850
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get recent sales
router.get('/recent-sales', (req, res) => {
  try {
    const sales = db.prepare(`
      SELECT * FROM invoices
      ORDER BY created_at DESC
      LIMIT 5
    `).all()
    res.json(sales)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get sales chart data
router.get('/sales-chart', (req, res) => {
  try {
    const { period } = req.query
    let data = []
    const today = new Date()

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const sales = db.prepare(`
          SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
          WHERE invoice_date = ?
        `).get(dateStr).total
        data.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales
        })
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const sales = db.prepare(`
          SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
          WHERE invoice_date = ?
        `).get(dateStr).total
        data.push({
          name: date.getDate().toString(),
          sales
        })
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
        const sales = db.prepare(`
          SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
          WHERE invoice_date >= ? AND invoice_date < ?
        `).get(date.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0]).total
        data.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          sales
        })
      }
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


