import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Truck, Phone, Building } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { formatCurrency, formatDate } from '../utils/format'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../utils/api'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    gst_number: '',
    bank_details: '',
    notes: ''
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers()
      setSuppliers(data)
    } catch (error) {
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, formData)
        toast.success('Supplier updated successfully')
      } else {
        await createSupplier(formData)
        toast.success('Supplier added successfully')
      }
      setShowModal(false)
      resetForm()
      loadSuppliers()
    } catch (error) {
      toast.error(error.message || 'Failed to save supplier')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSupplier(selectedSupplier.id)
      toast.success('Supplier deleted successfully')
      setShowDeleteModal(false)
      loadSuppliers()
    } catch (error) {
      toast.error('Failed to delete supplier')
    }
  }

  const resetForm = () => {
    setSelectedSupplier(null)
    setFormData({
      name: '',
      company_name: '',
      phone: '',
      email: '',
      address: '',
      gst_number: '',
      bank_details: '',
      notes: ''
    })
  }

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name,
      company_name: supplier.company_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      gst_number: supplier.gst_number || '',
      bank_details: supplier.bank_details || '',
      notes: supplier.notes || ''
    })
    setShowModal(true)
  }

  const columns = [
    {
      key: 'name',
      label: 'Supplier',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            {row.company_name && <p className="text-xs text-navy-400">{row.company_name}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-navy-400" />
          <span>{value || '-'}</span>
        </div>
      )
    },
    {
      key: 'total_purchases',
      label: 'Total Purchases',
      sortable: true,
      render: (value) => (
        <span className="text-gold-400 font-semibold">{formatCurrency(value || 0)}</span>
      )
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      sortable: true,
      render: (value) => (
        <span className={value > 0 ? 'text-red-400' : 'text-emerald-400'}>
          {formatCurrency(value || 0)}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Added On',
      sortable: true,
      render: (value) => formatDate(value)
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
              setSelectedSupplier(row)
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
          <h1 className="text-3xl font-display font-bold text-white">Suppliers</h1>
          <p className="text-navy-300 mt-1">Manage your supplier relationships</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Suppliers</p>
          <p className="text-2xl font-bold text-white mt-1">{suppliers.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Purchases</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">
            {formatCurrency(suppliers.reduce((sum, s) => sum + (s.total_purchases || 0), 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Outstanding Payments</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {formatCurrency(suppliers.reduce((sum, s) => sum + (s.outstanding || 0), 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Active Suppliers</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{suppliers.length}</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search suppliers..."
        emptyMessage="No suppliers found"
        emptyIcon={Truck}
      />

      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-navy-300 mb-2">Contact Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Contact person name"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="input-field"
                placeholder="Business name"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="email@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-navy-300 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="input-field resize-none"
                placeholder="Full address"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">GST Number</label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                className="input-field"
                placeholder="22XXXXX1234X1Z5"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">Bank Details</label>
              <input
                type="text"
                value={formData.bank_details}
                onChange={(e) => setFormData({ ...formData, bank_details: e.target.value })}
                className="input-field"
                placeholder="Bank account info"
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
              {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Supplier"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-navy-200">
            Are you sure you want to delete{' '}
            <span className="text-gold-400 font-semibold">{selectedSupplier?.name}</span>?
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


