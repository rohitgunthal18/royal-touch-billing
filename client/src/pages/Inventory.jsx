import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  Gem
} from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { formatCurrency, formatWeight, jewelryCategories, metalTypes, purityOptions } from '../utils/format'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMetal, setFilterMetal] = useState('all')

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    hsn_code: '7113',
    category: 'Rings',
    metal_type: 'gold',
    purity: '22K',
    weight: '',
    stock: '',
    cost_price: '',
    selling_price: '',
    making_charges: '',
    min_stock: '1',
    description: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData)
        toast.success('Product updated successfully')
      } else {
        await createProduct(formData)
        toast.success('Product added successfully')
      }
      setShowModal(false)
      resetForm()
      loadProducts()
    } catch (error) {
      toast.error(error.message || 'Failed to save product')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProduct(selectedProduct.id)
      toast.success('Product deleted successfully')
      setShowDeleteModal(false)
      loadProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const resetForm = () => {
    setSelectedProduct(null)
    setFormData({
      name: '',
      sku: '',
      hsn_code: '7113',
      category: 'Rings',
      metal_type: 'gold',
      purity: '22K',
      weight: '',
      stock: '',
      cost_price: '',
      selling_price: '',
      making_charges: '',
      min_stock: '1',
      description: ''
    })
  }

  const openEditModal = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku || '',
      hsn_code: product.hsn_code || '7113',
      category: product.category,
      metal_type: product.metal_type,
      purity: product.purity,
      weight: product.weight,
      stock: product.stock,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      making_charges: product.making_charges || '',
      min_stock: product.min_stock || '1',
      description: product.description || ''
    })
    setShowModal(true)
  }

  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false
    if (filterMetal !== 'all' && p.metal_type !== filterMetal) return false
    return true
  })

  const lowStockProducts = products.filter(p => p.stock <= (p.min_stock || 1))

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: metalTypes.find(m => m.value === row.metal_type)?.color + '20' }}
          >
            <Gem
              className="w-5 h-5"
              style={{ color: metalTypes.find(m => m.value === row.metal_type)?.color }}
            />
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-xs text-navy-400">{row.sku || 'No SKU'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true
    },
    {
      key: 'purity',
      label: 'Purity',
      render: (value) => (
        <span className="px-2 py-1 rounded-lg bg-gold-500/20 text-gold-400 text-sm">
          {value}
        </span>
      )
    },
    {
      key: 'weight',
      label: 'Weight',
      sortable: true,
      render: (value) => formatWeight(value)
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className={value <= (row.min_stock || 1) ? 'text-red-400' : 'text-white'}>
            {value}
          </span>
          {value <= (row.min_stock || 1) && (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
        </div>
      )
    },
    {
      key: 'selling_price',
      label: 'Price',
      sortable: true,
      render: (value) => (
        <span className="text-gold-400 font-semibold">{formatCurrency(value)}</span>
      )
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
              setSelectedProduct(row)
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
          <h1 className="text-3xl font-display font-bold text-white">Inventory</h1>
          <p className="text-navy-300 mt-1">Manage your jewelry products</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Products</p>
          <p className="text-2xl font-bold text-white mt-1">{products.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Stock Value</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">
            {formatCurrency(products.reduce((sum, p) => sum + (p.selling_price * p.stock), 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Weight</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatWeight(products.reduce((sum, p) => sum + (p.weight * p.stock), 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{lowStockProducts.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Categories</option>
          {jewelryCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterMetal}
          onChange={(e) => setFilterMetal(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Metals</option>
          {metalTypes.map((metal) => (
            <option key={metal.value} value={metal.value}>{metal.label}</option>
          ))}
        </select>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="glass-card p-4 border-l-4 border-red-400">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-white font-medium">Low Stock Alert</p>
              <p className="text-sm text-navy-300">
                {lowStockProducts.length} products are running low on stock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search products..."
        emptyMessage="No products found"
        emptyIcon={Package}
      />

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-navy-300 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Gold Ring 22K"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input-field"
                placeholder="e.g., GR-22K-001"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {jewelryCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Metal Type *</label>
              <select
                required
                value={formData.metal_type}
                onChange={(e) => setFormData({ ...formData, metal_type: e.target.value })}
                className="input-field"
              >
                {metalTypes.map((metal) => (
                  <option key={metal.value} value={metal.value}>{metal.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Purity *</label>
              <select
                required
                value={formData.purity}
                onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                className="input-field"
              >
                {purityOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Weight (grams) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Stock Quantity *</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Minimum Stock Alert</label>
              <input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                className="input-field"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Cost Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Making Charges (₹)</label>
              <input
                type="number"
                value={formData.making_charges}
                onChange={(e) => setFormData({ ...formData, making_charges: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">HSN Code</label>
              <input
                type="text"
                value={formData.hsn_code}
                onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                className="input-field"
                placeholder="7113"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-navy-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Product description..."
            />
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
              {selectedProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-navy-200">
            Are you sure you want to delete{' '}
            <span className="text-gold-400 font-semibold">{selectedProduct?.name}</span>?
            This action cannot be undone.
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


