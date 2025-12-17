import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Receipt, TrendingUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, paymentMethods } from '../utils/format'
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../utils/api'

const expenseCategories = [
  'Rent',
  'Utilities',
  'Salaries',
  'Marketing',
  'Insurance',
  'Maintenance',
  'Office Supplies',
  'Travel',
  'Professional Fees',
  'Miscellaneous'
]

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  const [formData, setFormData] = useState({
    category: 'Miscellaneous',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference: '',
    notes: ''
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const data = await getExpenses()
      setExpenses(data)
    } catch (error) {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, formData)
        toast.success('Expense updated successfully')
      } else {
        await createExpense(formData)
        toast.success('Expense added successfully')
      }
      setShowModal(false)
      resetForm()
      loadExpenses()
    } catch (error) {
      toast.error(error.message || 'Failed to save expense')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteExpense(selectedExpense.id)
      toast.success('Expense deleted successfully')
      setShowDeleteModal(false)
      loadExpenses()
    } catch (error) {
      toast.error('Failed to delete expense')
    }
  }

  const resetForm = () => {
    setSelectedExpense(null)
    setFormData({
      category: 'Miscellaneous',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference: '',
      notes: ''
    })
  }

  const openEditModal = (expense) => {
    setSelectedExpense(expense)
    setFormData({
      category: expense.category,
      description: expense.description || '',
      amount: expense.amount,
      expense_date: expense.expense_date,
      payment_method: expense.payment_method || 'cash',
      reference: expense.reference || '',
      notes: expense.notes || ''
    })
    setShowModal(true)
  }

  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false
    const expenseDate = new Date(e.expense_date)
    if (dateRange.from && expenseDate < new Date(dateRange.from)) return false
    if (dateRange.to && expenseDate > new Date(dateRange.to)) return false
    return true
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const expensesByCategory = expenseCategories.map(cat => ({
    category: cat,
    total: filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const columns = [
    {
      key: 'expense_date',
      label: 'Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-navy-700/50 text-navy-200">
          {value}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => value || '-'
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-red-400">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'payment_method',
      label: 'Payment',
      render: (value) => value?.replace('_', ' ').charAt(0).toUpperCase() + value?.slice(1).replace('_', ' ') || 'Cash'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Edit className="w-4 h-4 text-navy-300" />
          </button>
          <button
            onClick={() => {
              setSelectedExpense(row)
              setShowDeleteModal(true)
            }}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Expenses</h1>
          <p className="text-navy-300 mt-1">Track your business expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">This Month</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatCurrency(expenses.filter(e => {
              const date = new Date(e.expense_date)
              const now = new Date()
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            }).reduce((sum, e) => sum + e.amount, 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Average Expense</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">
            {formatCurrency(expenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Records</p>
          <p className="text-2xl font-bold text-white mt-1">{filteredExpenses.length}</p>
        </div>
      </div>

      {/* Expense by Category */}
      {expensesByCategory.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Expenses by Category</h2>
          <div className="space-y-3">
            {expensesByCategory.slice(0, 5).map((item) => (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-navy-200">{item.category}</span>
                  <span className="text-white">{formatCurrency(item.total)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full gold-gradient rounded-full transition-all duration-500"
                    style={{ width: `${(item.total / totalExpenses) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Categories</option>
          {expenseCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="input-field w-auto"
        />
        <span className="text-navy-400 self-center">to</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="input-field w-auto"
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredExpenses}
        searchPlaceholder="Search expenses..."
        emptyMessage="No expenses found"
        emptyIcon={Receipt}
      />

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedExpense ? 'Edit Expense' : 'Add Expense'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-navy-300 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="input-field"
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-navy-300 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Brief description"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Reference #</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="input-field"
                placeholder="Bill/Receipt number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-navy-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="input-field resize-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {selectedExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Expense"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-navy-200">
            Are you sure you want to delete this expense of{' '}
            <span className="text-gold-400 font-semibold">{formatCurrency(selectedExpense?.amount)}</span>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-6 py-3 bg-red-500/20 text-red-400 font-medium rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


