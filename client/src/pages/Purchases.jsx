import { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, Receipt, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, statusColors, paymentMethods, generateInvoiceNumber } from '../utils/format'
import { getPurchases, createPurchase, updatePurchase, deletePurchase, getSuppliers, getProducts } from '../utils/api'

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)

  const [formData, setFormData] = useState({
    purchase_number: generateInvoiceNumber('PO'),
    purchase_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    supplier_name: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total_amount: 0,
    payment_method: 'cash',
    payment_status: 'paid',
    notes: ''
  })

  const [newItem, setNewItem] = useState({
    product_name: '',
    quantity: 1,
    weight: 0,
    unit_price: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [purchasesData, suppliersData, productsData] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getProducts()
      ])
      setPurchases(purchasesData)
      setSuppliers(suppliersData)
      setProducts(productsData)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const tax = subtotal * 0.03 // 3% GST
    return {
      subtotal,
      tax,
      total_amount: subtotal + tax
    }
  }

  const addItem = () => {
    if (!newItem.product_name || newItem.quantity <= 0) {
      toast.error('Please fill item details')
      return
    }
    const items = [...formData.items, { ...newItem, total: newItem.quantity * newItem.unit_price }]
    const totals = calculateTotals(items)
    setFormData({ ...formData, items, ...totals })
    setNewItem({ product_name: '', quantity: 1, weight: 0, unit_price: 0 })
  }

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index)
    const totals = calculateTotals(items)
    setFormData({ ...formData, items, ...totals })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.items.length === 0) {
      toast.error('Please add at least one item')
      return
    }
    try {
      if (selectedPurchase) {
        await updatePurchase(selectedPurchase.id, formData)
        toast.success('Purchase updated successfully')
      } else {
        await createPurchase(formData)
        toast.success('Purchase recorded successfully')
      }
      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(error.message || 'Failed to save purchase')
    }
  }

  const handleDelete = async () => {
    try {
      await deletePurchase(selectedPurchase.id)
      toast.success('Purchase deleted successfully')
      setShowDeleteModal(false)
      loadData()
    } catch (error) {
      toast.error('Failed to delete purchase')
    }
  }

  const resetForm = () => {
    setSelectedPurchase(null)
    setFormData({
      purchase_number: generateInvoiceNumber('PO'),
      purchase_date: new Date().toISOString().split('T')[0],
      supplier_id: '',
      supplier_name: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total_amount: 0,
      payment_method: 'cash',
      payment_status: 'paid',
      notes: ''
    })
  }

  const columns = [
    {
      key: 'purchase_number',
      label: 'Purchase #',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-gold-400">{value}</span>
      )
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      sortable: true,
      render: (value) => value || 'Unknown'
    },
    {
      key: 'purchase_date',
      label: 'Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gold-400">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPurchase(row)
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
          <h1 className="text-3xl font-display font-bold text-white">Purchases</h1>
          <p className="text-navy-300 mt-1">Track your purchase orders</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          New Purchase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Purchases</p>
          <p className="text-2xl font-bold text-white mt-1">{purchases.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Value</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">
            {formatCurrency(purchases.reduce((sum, p) => sum + p.total_amount, 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Paid</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {purchases.filter(p => p.payment_status === 'paid').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {purchases.filter(p => p.payment_status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={purchases}
        searchPlaceholder="Search purchases..."
        emptyMessage="No purchases found"
        emptyIcon={Receipt}
      />

      {/* Add Purchase Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Purchase Order"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-navy-300 mb-2">Purchase #</label>
              <input
                type="text"
                value={formData.purchase_number}
                onChange={(e) => setFormData({ ...formData, purchase_number: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Supplier *</label>
              <select
                required
                value={formData.supplier_id}
                onChange={(e) => {
                  const supplier = suppliers.find(s => s.id === parseInt(e.target.value))
                  setFormData({
                    ...formData,
                    supplier_id: e.target.value,
                    supplier_name: supplier?.name || ''
                  })
                }}
                className="input-field"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Items</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs text-navy-400 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newItem.product_name}
                  onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
                  className="input-field py-2"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-xs text-navy-400 mb-1">Weight (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.weight}
                  onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                  className="input-field py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-navy-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="input-field py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-navy-400 mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                  className="input-field py-2"
                />
              </div>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.product_name}</p>
                      <p className="text-sm text-navy-300">
                        {item.weight}g × {item.quantity} @ {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gold-400 font-semibold">{formatCurrency(item.total)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-navy-300">Subtotal</span>
              <span className="text-white">{formatCurrency(formData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-300">GST (3%)</span>
              <span className="text-white">{formatCurrency(formData.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
              <span className="text-white">Total</span>
              <span className="text-gold-400">{formatCurrency(formData.total_amount)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm text-navy-300 mb-2">Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="input-field"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
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
              Save Purchase
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Purchase"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-navy-200">
            Are you sure you want to delete purchase{' '}
            <span className="text-gold-400 font-semibold">{selectedPurchase?.purchase_number}</span>?
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


