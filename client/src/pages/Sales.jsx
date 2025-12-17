import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, Edit, Trash2, Download, ShoppingCart, Filter, Settings, Printer, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import InvoicePDF from '../components/InvoicePDF'
import { formatCurrency, formatDate, statusColors } from '../utils/format'
import { getInvoices, deleteInvoice, getInvoice, getSettings } from '../utils/api'

export default function Sales() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [settings, setSettings] = useState({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [invoicesData, settingsData] = await Promise.all([
        getInvoices(),
        getSettings()
      ])
      setInvoices(invoicesData)
      setSettings(settingsData || {})
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadInvoiceDetails = async (invoice) => {
    try {
      const fullInvoice = await getInvoice(invoice.id)
      setSelectedInvoice(fullInvoice)
      return fullInvoice
    } catch (error) {
      toast.error('Failed to load invoice details')
      return invoice
    }
  }

  const handleViewInvoice = async (invoice) => {
    await loadInvoiceDetails(invoice)
    setShowViewModal(true)
  }

  const handleDownloadPDF = async (invoice) => {
    const fullInvoice = await loadInvoiceDetails(invoice)
    setSelectedInvoice(fullInvoice)
    setShowPDFModal(true)
  }

  const handleEditInvoice = (invoice) => {
    navigate(`/sales/edit/${invoice.id}`)
  }

  const handleDelete = async () => {
    try {
      await deleteInvoice(selectedInvoice.id)
      toast.success('Invoice deleted successfully')
      setShowDeleteModal(false)
      loadInvoices()
    } catch (error) {
      toast.error('Failed to delete invoice')
    }
  }

  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.payment_status === filterStatus)

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-gold-400">{value}</span>
      )
    },
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value || 'Walk-in Customer'}</p>
          {row.customer_phone && (
            <p className="text-xs text-navy-400">{row.customer_phone}</p>
          )}
        </div>
      )
    },
    {
      key: 'invoice_date',
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewInvoice(row)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-navy-300" />
          </button>
          <button
            onClick={() => handleDownloadPDF(row)}
            className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
            title="Download/Print PDF"
          >
            <Download className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={() => handleEditInvoice(row)}
            className="p-2 rounded-lg hover:bg-gold-500/20 transition-colors"
            title="Edit Invoice"
          >
            <Edit className="w-4 h-4 text-gold-400" />
          </button>
          <button
            onClick={() => {
              setSelectedInvoice(row)
              setShowDeleteModal(true)
            }}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
            title="Delete"
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
          <h1 className="text-3xl font-display font-bold text-white">Sales & Invoices</h1>
          <p className="text-navy-300 mt-1">Manage your sales and invoices</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/sales/invoice-settings"
            className="btn-secondary inline-flex items-center gap-2"
            title="Invoice Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Invoice Settings</span>
          </Link>
          <Link to="/sales/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Invoices</p>
          <p className="text-2xl font-bold text-white mt-1">{invoices.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Total Sales</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">
            {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total_amount, 0))}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Paid</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {invoices.filter(inv => inv.payment_status === 'paid').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-navy-300">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {invoices.filter(inv => inv.payment_status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'paid', 'pending', 'partial', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-gold-500 text-navy-950'
                : 'bg-white/5 text-navy-200 hover:bg-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-black/20 text-xs">
                {invoices.filter(inv => inv.payment_status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        searchPlaceholder="Search invoices..."
        emptyMessage="No invoices found"
        emptyIcon={ShoppingCart}
      />

      {/* View Invoice Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Invoice ${selectedInvoice?.invoice_number}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-navy-300">Customer</p>
                <p className="text-white font-medium">{selectedInvoice.customer_name || 'Walk-in'}</p>
              </div>
              <div>
                <p className="text-sm text-navy-300">Date</p>
                <p className="text-white">{formatDate(selectedInvoice.invoice_date)}</p>
              </div>
              <div>
                <p className="text-sm text-navy-300">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedInvoice.payment_status]}`}>
                  {selectedInvoice.payment_status}
                </span>
              </div>
              <div>
                <p className="text-sm text-navy-300">Payment Method</p>
                <p className="text-white">{selectedInvoice.payment_method || 'Cash'}</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
              <div className="space-y-3">
                {selectedInvoice.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.product_name}</p>
                      <p className="text-sm text-navy-300">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <p className="text-gold-400 font-semibold">{formatCurrency(item.total)}</p>
                  </div>
                )) || <p className="text-navy-400">No items data available</p>}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-navy-300">Subtotal</span>
                <span className="text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-300">CGST</span>
                <span className="text-white">{formatCurrency(selectedInvoice.cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-300">SGST</span>
                <span className="text-white">{formatCurrency(selectedInvoice.sgst)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-gold-400">{formatCurrency(selectedInvoice.total_amount)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => {
                  setShowViewModal(false)
                  setShowPDFModal(true)
                }}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditInvoice(selectedInvoice)
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        title={`Invoice ${selectedInvoice?.invoice_number}`}
        size="full"
      >
        {selectedInvoice && (
          <InvoicePDF 
            invoice={selectedInvoice} 
            settings={settings} 
            onClose={() => setShowPDFModal(false)} 
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Invoice"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-navy-200">
            Are you sure you want to delete invoice{' '}
            <span className="text-gold-400 font-semibold">{selectedInvoice?.invoice_number}</span>?
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


