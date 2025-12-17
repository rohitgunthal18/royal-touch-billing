import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { formatCurrency, formatDate } from '../utils/format'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../utils/api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gst_number: '',
    pan_number: '',
    notes: ''
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (error) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, formData)
        toast.success('Customer updated successfully')
      } else {
        await createCustomer(formData)
        toast.success('Customer added successfully')
      }
      setShowModal(false)
      resetForm()
      loadCustomers()
    } catch (error) {
      toast.error(error.message || 'Failed to save customer')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCustomer(selectedCustomer.id)
      toast.success('Customer deleted successfully')
      setShowDeleteModal(false)
      loadCustomers()
    } catch (error) {
      toast.error('Failed to delete customer')
    }
  }

  const resetForm = () => {
    setSelectedCustomer(null)
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      gst_number: '',
      pan_number: '',
      notes: ''
    })
  }

  const openEditModal = (customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gst_number: customer.gst_number || '',
      pan_number: customer.pan_number || '',
      notes: customer.notes || ''
    })
    setShowModal(true)
  }

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-navy-950 font-bold">{value.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            {row.email && <p className="text-xs text-navy-400">{row.email}</p>}
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
      label: 'Joined',
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
              setSelectedCustomer(row)
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
          <h1 className="text-3xl font-display font-bold text-white">Customers</h1>
          <p className="text-navy-300 mt-1">Manage your customer relationships</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Customers</p>
          <p className="text-2xl font-bold text-white mt-1">{customers.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Revenue</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">
            {formatCurrency(customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Outstanding Amount</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {formatCurrency(customers.reduce((sum, c) => sum + (c.outstanding || 0), 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">New This Month</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {customers.filter(c => {
              const createdAt = new Date(c.created_at)
              const now = new Date()
              return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers..."
        emptyMessage="No customers found"
        emptyIcon={Users}
      />

      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-navy-300 mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Full name"
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
              <label className="block text-sm text-navy-300 mb-2">PAN Number</label>
              <input
                type="text"
                value={formData.pan_number}
                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                className="input-field"
                placeholder="XXXXX1234X"
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
              {selectedCustomer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-navy-200">
            Are you sure you want to delete{' '}
            <span className="text-gold-400 font-semibold">{selectedCustomer?.name}</span>?
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


