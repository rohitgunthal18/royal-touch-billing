import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Profit & Loss Report
router.get('/profit-loss', (req, res) => {
  try {
    const { from, to } = req.query

    // Total revenue from sales
    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
      WHERE invoice_date >= ? AND invoice_date <= ?
    `).get(from, to).total

    // Total purchases
    const totalPurchases = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases
      WHERE purchase_date >= ? AND purchase_date <= ?
    `).get(from, to).total

    // Total expenses
    const totalExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses
      WHERE expense_date >= ? AND expense_date <= ?
    `).get(from, to).total

    const netProfit = totalRevenue - totalPurchases - totalExpenses

    // Monthly chart data
    const chartData = []
    const startDate = new Date(from)
    const endDate = new Date(to)
    
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const monthRevenue = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
        WHERE invoice_date >= ? AND invoice_date <= ?
      `).get(monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]).total

      const monthExpenses = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM expenses
        WHERE expense_date >= ? AND expense_date <= ?
      `).get(monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]).total

      chartData.push({
        name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue,
        expenses: monthExpenses
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    res.json({
      totalRevenue,
      totalPurchases,
      totalExpenses,
      netProfit,
      chartData
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Sales Report
router.get('/sales', (req, res) => {
  try {
    const { from, to } = req.query

    const totalSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
      WHERE invoice_date >= ? AND invoice_date <= ?
    `).get(from, to).total

    const invoiceCount = db.prepare(`
      SELECT COUNT(*) as count FROM invoices
      WHERE invoice_date >= ? AND invoice_date <= ?
    `).get(from, to).count

    const averageSale = invoiceCount > 0 ? totalSales / invoiceCount : 0

    const pendingAmount = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices
      WHERE invoice_date >= ? AND invoice_date <= ? AND payment_status = 'pending'
    `).get(from, to).total

    // Daily sales
    const salesByDay = db.prepare(`
      SELECT invoice_date as date, SUM(total_amount) as amount
      FROM invoices
      WHERE invoice_date >= ? AND invoice_date <= ?
      GROUP BY invoice_date
      ORDER BY invoice_date
    `).all(from, to)

    // Top products (from invoice items)
    const topProducts = db.prepare(`
      SELECT product_name as name, SUM(quantity) as quantity, SUM(total) as total
      FROM invoice_items
      JOIN invoices ON invoices.id = invoice_items.invoice_id
      WHERE invoices.invoice_date >= ? AND invoices.invoice_date <= ?
      GROUP BY product_name
      ORDER BY total DESC
      LIMIT 5
    `).all(from, to)

    res.json({
      totalSales,
      invoiceCount,
      averageSale,
      pendingAmount,
      salesByDay,
      topProducts
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Purchase Report
router.get('/purchases', (req, res) => {
  try {
    const { from, to } = req.query

    const totalPurchases = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases
      WHERE purchase_date >= ? AND purchase_date <= ?
    `).get(from, to).total

    const purchaseCount = db.prepare(`
      SELECT COUNT(*) as count FROM purchases
      WHERE purchase_date >= ? AND purchase_date <= ?
    `).get(from, to).count

    res.json({
      totalSales: totalPurchases,
      invoiceCount: purchaseCount,
      averageSale: purchaseCount > 0 ? totalPurchases / purchaseCount : 0,
      pendingAmount: 0,
      salesByDay: [],
      topProducts: []
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Expense Report
router.get('/expenses', (req, res) => {
  try {
    const { from, to } = req.query

    const totalExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses
      WHERE expense_date >= ? AND expense_date <= ?
    `).get(from, to).total

    const expenseCount = db.prepare(`
      SELECT COUNT(*) as count FROM expenses
      WHERE expense_date >= ? AND expense_date <= ?
    `).get(from, to).count

    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0

    // By category
    const byCategory = db.prepare(`
      SELECT category as name, SUM(amount) as value
      FROM expenses
      WHERE expense_date >= ? AND expense_date <= ?
      GROUP BY category
      ORDER BY value DESC
    `).all(from, to)

    res.json({
      totalExpenses,
      categoryCount: byCategory.length,
      averageExpense,
      byCategory
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Inventory Report
router.get('/inventory', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count

    const totalValue = db.prepare(`
      SELECT COALESCE(SUM(selling_price * stock), 0) as total FROM products
    `).get().total

    const totalWeight = db.prepare(`
      SELECT COALESCE(SUM(weight * stock), 0) as total FROM products
    `).get().total

    const lowStock = db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE stock <= min_stock
    `).get().count

    // By category
    const byCategory = db.prepare(`
      SELECT category as name, SUM(selling_price * stock) as value
      FROM products
      GROUP BY category
      ORDER BY value DESC
    `).all()

    res.json({
      totalProducts,
      totalValue,
      totalWeight,
      lowStock,
      byCategory
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Customer Report
router.get('/customers', (req, res) => {
  try {
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count

    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(total_purchases), 0) as total FROM customers
    `).get().total

    const totalOutstanding = db.prepare(`
      SELECT COALESCE(SUM(outstanding), 0) as total FROM customers
    `).get().total

    const thisMonth = new Date()
    thisMonth.setDate(1)
    const newThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM customers WHERE created_at >= ?
    `).get(thisMonth.toISOString().split('T')[0]).count

    // Top customers
    const topCustomers = db.prepare(`
      SELECT name, total_purchases as total,
        (SELECT COUNT(*) FROM invoices WHERE customer_id = customers.id) as invoiceCount
      FROM customers
      ORDER BY total_purchases DESC
      LIMIT 10
    `).all()

    res.json({
      totalCustomers,
      totalRevenue,
      totalOutstanding,
      newThisMonth,
      topCustomers
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router


