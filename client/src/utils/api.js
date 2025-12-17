// Use environment variable for API base URL in production
const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

// Dashboard
export const getDashboardStats = () => request('/dashboard/stats')
export const getRecentSales = () => request('/dashboard/recent-sales')
export const getSalesChart = (period) => request(`/dashboard/sales-chart?period=${period}`)

// Customers
export const getCustomers = () => request('/customers')
export const getCustomer = (id) => request(`/customers/${id}`)
export const createCustomer = (data) => request('/customers', { method: 'POST', body: data })
export const updateCustomer = (id, data) => request(`/customers/${id}`, { method: 'PUT', body: data })
export const deleteCustomer = (id) => request(`/customers/${id}`, { method: 'DELETE' })

// Suppliers
export const getSuppliers = () => request('/suppliers')
export const getSupplier = (id) => request(`/suppliers/${id}`)
export const createSupplier = (data) => request('/suppliers', { method: 'POST', body: data })
export const updateSupplier = (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: data })
export const deleteSupplier = (id) => request(`/suppliers/${id}`, { method: 'DELETE' })

// Inventory
export const getProducts = () => request('/products')
export const getProduct = (id) => request(`/products/${id}`)
export const createProduct = (data) => request('/products', { method: 'POST', body: data })
export const updateProduct = (id, data) => request(`/products/${id}`, { method: 'PUT', body: data })
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' })
export const getCategories = () => request('/categories')

// Invoices (Sales)
export const getInvoices = () => request('/invoices')
export const getInvoice = (id) => request(`/invoices/${id}`)
export const createInvoice = (data) => request('/invoices', { method: 'POST', body: data })
export const updateInvoice = (id, data) => request(`/invoices/${id}`, { method: 'PUT', body: data })
export const deleteInvoice = (id) => request(`/invoices/${id}`, { method: 'DELETE' })

// Purchases
export const getPurchases = () => request('/purchases')
export const getPurchase = (id) => request(`/purchases/${id}`)
export const createPurchase = (data) => request('/purchases', { method: 'POST', body: data })
export const updatePurchase = (id, data) => request(`/purchases/${id}`, { method: 'PUT', body: data })
export const deletePurchase = (id) => request(`/purchases/${id}`, { method: 'DELETE' })

// Expenses
export const getExpenses = () => request('/expenses')
export const getExpense = (id) => request(`/expenses/${id}`)
export const createExpense = (data) => request('/expenses', { method: 'POST', body: data })
export const updateExpense = (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: data })
export const deleteExpense = (id) => request(`/expenses/${id}`, { method: 'DELETE' })
export const getExpenseCategories = () => request('/expense-categories')

// Reports
export const getSalesReport = (params) => request(`/reports/sales?${new URLSearchParams(params)}`)
export const getPurchaseReport = (params) => request(`/reports/purchases?${new URLSearchParams(params)}`)
export const getExpenseReport = (params) => request(`/reports/expenses?${new URLSearchParams(params)}`)
export const getProfitLossReport = (params) => request(`/reports/profit-loss?${new URLSearchParams(params)}`)
export const getInventoryReport = () => request('/reports/inventory')
export const getCustomerReport = () => request('/reports/customers')

// Settings
export const getSettings = () => request('/settings')
export const updateSettings = (data) => request('/settings', { method: 'PUT', body: data })


