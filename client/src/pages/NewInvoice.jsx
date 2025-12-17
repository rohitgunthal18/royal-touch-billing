import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Search,
  Save,
  ArrowLeft,
  Settings,
  FileText,
  ImagePlus,
  File,
  ChevronDown,
  X,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import InvoicePDF from '../components/InvoicePDF'
import {
  formatCurrency,
  generateInvoiceNumber,
  paymentMethods,
  purityOptions
} from '../utils/format'
import {
  getCustomers,
  getProducts,
  getInvoice,
  createInvoice,
  updateInvoice,
  getSettings,
  createProduct,
  createCustomer
} from '../utils/api'

const unitTypes = [
  { value: 'pcs', label: 'PCS' },
  { value: 'gm', label: 'GM' },
  { value: 'kg', label: 'KG' },
  { value: 'box', label: 'BOX' },
  { value: 'pair', label: 'PAIR' },
  { value: 'set', label: 'SET' },
  { value: 'none', label: 'NONE' }
]

const taxRates = [
  { value: 0, label: 'No Tax' },
  { value: 0.25, label: 'GST 0.25%' },
  { value: 3, label: 'GST 3%' },
  { value: 5, label: 'GST 5%' },
  { value: 12, label: 'GST 12%' },
  { value: 18, label: 'GST 18%' },
  { value: 28, label: 'GST 28%' }
]

const statesOfIndia = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
]

const categories = ['Rings', 'Necklaces', 'Earrings', 'Bangles', 'Bracelets', 'Pendants', 'Chains', 'Anklets', 'Nose Pins', 'Mangalsutra', 'Coins & Bars', 'Other']

export default function NewInvoice() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [invoiceType, setInvoiceType] = useState('cash')
  
  const [invoice, setInvoice] = useState({
    invoice_number: generateInvoiceNumber(),
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_gst: '',
    state_of_supply: '',
    items: [],
    subtotal: 0,
    discount_type: 'percent',
    discount_value: 0,
    discount_amount: 0,
    tax_rate: 3,
    tax_amount: 0,
    round_off: 0,
    total_amount: 0,
    amount_paid: 0,
    balance_due: 0,
    payment_method: 'cash',
    payment_status: 'paid',
    notes: '',
    description: ''
  })

  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [settings, setSettings] = useState({})
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showQuickCustomerForm, setShowQuickCustomerForm] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showQuickProductForm, setShowQuickProductForm] = useState(false)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [searchCustomer, setSearchCustomer] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [roundOff, setRoundOff] = useState(true)

  // Quick Customer Form State
  const [quickCustomer, setQuickCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gst_number: '',
    pan_number: ''
  })

  // Quick Product Form State
  const [quickProduct, setQuickProduct] = useState({
    name: '',
    sku: '',
    category: 'Other',
    metal_type: 'gold',
    purity: '22K',
    weight: 0,
    selling_price: 0,
    making_charges: 0,
    hsn_code: '7113',
    stock: 1
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [customersData, productsData, settingsData] = await Promise.all([
        getCustomers(),
        getProducts(),
        getSettings()
      ])
      setCustomers(customersData)
      setProducts(productsData)
      setSettings(settingsData || {})

      if (isEditing) {
        const invoiceData = await getInvoice(id)
        setInvoice(invoiceData)
        setInvoiceType(invoiceData.payment_status === 'pending' ? 'credit' : 'cash')
      }
    } catch (error) {
      toast.error('Failed to load data')
    }
  }

  const calculateTotals = (items, discountType = invoice.discount_type, discountValue = invoice.discount_value, taxRate = invoice.tax_rate) => {
    let subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    
    // Calculate overall discount
    const discountAmount = discountType === 'percent' 
      ? (subtotal * discountValue) / 100 
      : discountValue
    
    const afterDiscount = subtotal - discountAmount
    
    // Calculate tax
    const taxAmount = (afterDiscount * taxRate) / 100
    
    const beforeRound = afterDiscount + taxAmount
    const roundOffValue = roundOff ? Math.round(beforeRound) - beforeRound : 0
    const totalAmount = beforeRound + roundOffValue

    const amountPaid = invoiceType === 'cash' ? totalAmount : invoice.amount_paid
    const balanceDue = totalAmount - amountPaid

    // Update item totals
    const updatedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.unit_price
    }))

    return {
      items: updatedItems,
      subtotal,
      discount_type: discountType,
      discount_value: discountValue,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      round_off: roundOffValue,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      balance_due: balanceDue,
      payment_status: balanceDue <= 0 ? 'paid' : balanceDue < totalAmount ? 'partial' : 'pending'
    }
  }

  const selectCustomer = (customer) => {
    setInvoice({
      ...invoice,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_gst: customer.gst_number || ''
    })
    setShowCustomerModal(false)
  }

  const addProduct = (product) => {
    const newItem = {
      id: Date.now(),
      product_id: product.id,
      product_name: product.name,
      hsn_code: product.hsn_code || '7113',
      category: product.category,
      metal_type: product.metal_type,
      purity: product.purity,
      weight: product.weight || 0,
      quantity: 1,
      unit: 'pcs',
      unit_price: product.selling_price,
      making_charges: product.making_charges || 0,
      total: product.selling_price
    }

    const newItems = [...invoice.items, newItem]
    const totals = calculateTotals(newItems)
    setInvoice({ ...invoice, ...totals })
    setShowProductModal(false)
    setShowQuickProductForm(false)
  }

  const addEmptyRow = () => {
    const newItem = {
      id: Date.now(),
      product_id: null,
      product_name: '',
      hsn_code: '7113',
      category: '',
      metal_type: '',
      purity: '',
      weight: 0,
      quantity: 1,
      unit: 'pcs',
      unit_price: 0,
      making_charges: 0,
      total: 0
    }

    const newItems = [...invoice.items, newItem]
    setInvoice({ ...invoice, items: newItems })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...invoice.items]
    newItems[index][field] = value
    newItems[index].total = newItems[index].quantity * newItems[index].unit_price
    
    const totals = calculateTotals(newItems)
    setInvoice({ ...invoice, ...totals })
  }

  const removeItem = (index) => {
    const newItems = invoice.items.filter((_, i) => i !== index)
    const totals = calculateTotals(newItems)
    setInvoice({ ...invoice, ...totals })
  }

  const updateDiscount = (type, value) => {
    const totals = calculateTotals(invoice.items, type, parseFloat(value) || 0, invoice.tax_rate)
    setInvoice({ ...invoice, ...totals })
  }

  const updateTaxRate = (rate) => {
    const totals = calculateTotals(invoice.items, invoice.discount_type, invoice.discount_value, parseFloat(rate))
    setInvoice({ ...invoice, ...totals })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    
    if (invoice.items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        await updateInvoice(id, invoice)
        toast.success('Invoice updated successfully')
      } else {
        await createInvoice(invoice)
        toast.success('Invoice created successfully')
      }
      navigate('/sales')
    } catch (error) {
      toast.error(error.message || 'Failed to save invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCustomerSave = async () => {
    if (!quickCustomer.name) {
      toast.error('Please fill customer name')
      return
    }

    try {
      const savedCustomer = await createCustomer(quickCustomer)
      toast.success('Customer saved successfully')
      setCustomers([...customers, savedCustomer])
      selectCustomer(savedCustomer)
      setQuickCustomer({
        name: '',
        phone: '',
        email: '',
        address: '',
        gst_number: '',
        pan_number: ''
      })
      setShowQuickCustomerForm(false)
    } catch (error) {
      toast.error('Failed to save customer')
    }
  }

  const handleQuickProductSave = async () => {
    if (!quickProduct.name || !quickProduct.selling_price) {
      toast.error('Please fill product name and price')
      return
    }

    try {
      const savedProduct = await createProduct(quickProduct)
      toast.success('Product saved to inventory')
      setProducts([...products, savedProduct])
      addProduct(savedProduct)
      setQuickProduct({
        name: '',
        sku: '',
        category: 'Other',
        metal_type: 'gold',
        purity: '22K',
        weight: 0,
        selling_price: 0,
        making_charges: 0,
        hsn_code: '7113',
        stock: 1
      })
    } catch (error) {
      toast.error('Failed to save product')
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.phone?.includes(searchCustomer)
  )

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const totalQuantity = invoice.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between glass-card p-4 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sales')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy-200" />
          </button>
          <h1 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Sale' : 'New Invoice'}
          </h1>
        </div>

        {/* Invoice Type Toggle */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className={`text-sm ${invoiceType === 'credit' ? 'text-white' : 'text-navy-400'}`}>
              Credit
            </span>
            <button
              onClick={() => setInvoiceType(invoiceType === 'cash' ? 'credit' : 'cash')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                invoiceType === 'cash' ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  invoiceType === 'cash' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${invoiceType === 'cash' ? 'text-blue-400' : 'text-navy-400'}`}>
              Cash
            </span>
          </div>

          <button
            onClick={() => navigate('/sales/invoice-settings')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Invoice Settings"
          >
            <Settings className="w-5 h-5 text-navy-200" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Left Section - Customer & Items */}
        <div className="xl:col-span-3 space-y-4">
          {/* Customer Section */}
          <div className="glass-card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Billing Name */}
              <div>
                <label className="block text-xs text-navy-400 mb-1">Billing Name (Optional)</label>
                <input
                  type="text"
                  value={invoice.customer_name}
                  onChange={(e) => setInvoice({ ...invoice, customer_name: e.target.value })}
                  onClick={() => !invoice.customer_name && setShowCustomerModal(true)}
                  className="input-field py-2.5"
                  placeholder="Customer name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs text-navy-400 mb-1">Phone No.</label>
                <input
                  type="tel"
                  value={invoice.customer_phone}
                  onChange={(e) => setInvoice({ ...invoice, customer_phone: e.target.value })}
                  className="input-field py-2.5"
                  placeholder="Phone number"
                />
              </div>

              {/* Invoice details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-navy-400 whitespace-nowrap">Invoice No.</span>
                  <input
                    type="text"
                    value={invoice.invoice_number}
                    onChange={(e) => setInvoice({ ...invoice, invoice_number: e.target.value })}
                    className="flex-1 bg-transparent border-b border-white/20 text-white text-right text-sm focus:outline-none focus:border-gold-400 py-1"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-navy-400 whitespace-nowrap">Date</span>
                  <input
                    type="date"
                    value={invoice.invoice_date}
                    onChange={(e) => setInvoice({ ...invoice, invoice_date: e.target.value })}
                    className="bg-transparent border-b border-white/20 text-white text-sm focus:outline-none focus:border-gold-400 py-1"
                  />
                </div>
              </div>
            </div>

            {/* Address Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-navy-400 mb-1">Billing Address</label>
                <textarea
                  value={invoice.customer_address}
                  onChange={(e) => setInvoice({ ...invoice, customer_address: e.target.value })}
                  rows={2}
                  className="input-field py-2 resize-none"
                  placeholder="Customer address"
                />
              </div>
              <div>
                <label className="block text-xs text-navy-400 mb-1">State of Supply</label>
                <select
                  value={invoice.state_of_supply}
                  onChange={(e) => setInvoice({ ...invoice, state_of_supply: e.target.value })}
                  className="input-field py-2.5 text-white bg-navy-900"
                  style={{ backgroundColor: '#1a1744' }}
                >
                  <option value="" className="bg-navy-900 text-white">Select State</option>
                  {statesOfIndia.map(state => (
                    <option key={state} value={state} className="bg-navy-900 text-white">{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items Section - Responsive Cards for Mobile, Table for Desktop */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Items</h2>
            </div>

            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 text-xs font-medium text-navy-300">
                  <tr>
                    <th className="text-left p-3 w-12">#</th>
                    <th className="text-left p-3 min-w-[200px]">Item Name</th>
                    <th className="text-left p-3 w-20">HSN</th>
                    <th className="text-center p-3 w-20">Qty</th>
                    <th className="text-center p-3 w-24">Unit</th>
                    <th className="text-right p-3 w-32">Price (₹)</th>
                    <th className="text-right p-3 w-32">Amount (₹)</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-white/5 group">
                      <td className="p-3 text-navy-400">{index + 1}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.product_name}
                          onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-gold-400 text-white text-sm focus:outline-none py-1"
                          placeholder="Item name"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.hsn_code}
                          onChange={(e) => updateItem(index, 'hsn_code', e.target.value)}
                          className="w-full bg-white/5 rounded px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-white/5 rounded px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full bg-white/5 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                          style={{ backgroundColor: '#2a2555' }}
                        >
                          {unitTypes.map(unit => (
                            <option key={unit.value} value={unit.value} className="bg-navy-800 text-white">{unit.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white/5 rounded px-2 py-1.5 text-white text-sm text-right focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-gold-400 font-medium">{formatCurrency(item.total)}</span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1.5 rounded hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Shown on Mobile Only */}
            <div className="lg:hidden divide-y divide-white/10">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs text-navy-400">Item {index + 1}</span>
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                        className="w-full bg-white/5 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-400 mt-1"
                        placeholder="Item name"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-navy-400">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full bg-white/5 rounded px-3 py-2 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-gold-400 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-navy-400">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="w-full bg-white/5 rounded px-2 py-2 text-white text-sm focus:outline-none mt-1"
                        style={{ backgroundColor: '#2a2555' }}
                      >
                        {unitTypes.map(unit => (
                          <option key={unit.value} value={unit.value} className="bg-navy-800 text-white">{unit.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-navy-400">HSN</label>
                      <input
                        type="text"
                        value={item.hsn_code}
                        onChange={(e) => updateItem(index, 'hsn_code', e.target.value)}
                        className="w-full bg-white/5 rounded px-3 py-2 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-gold-400 mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-navy-400">Price (₹)</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/5 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-400 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-navy-400">Amount</label>
                      <div className="px-3 py-2 mt-1 text-gold-400 font-semibold">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Buttons */}
            <div className="p-4 border-t border-white/10 flex flex-wrap gap-3">
              <button
                onClick={() => setShowProductModal(true)}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Add from Products
              </button>
              <button
                onClick={addEmptyRow}
                className="px-4 py-2 border border-white/20 text-navy-300 rounded-lg text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Empty Row
              </button>
            </div>

            {/* Items Summary */}
            <div className="p-4 bg-white/5 flex flex-wrap justify-between items-center gap-4">
              <span className="text-navy-300">
                Total Items: <span className="text-white font-medium">{invoice.items.length}</span>
                <span className="mx-2">|</span>
                Total Qty: <span className="text-white font-medium">{totalQuantity}</span>
              </span>
              <span className="text-gold-400 font-semibold text-lg">
                Subtotal: {formatCurrency(invoice.subtotal)}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="glass-card p-4 space-y-4">
            {/* Payment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-navy-400 mb-1">Payment Method</label>
                <select
                  value={invoice.payment_method}
                  onChange={(e) => setInvoice({ ...invoice, payment_method: e.target.value })}
                  className="input-field py-2.5"
                  style={{ backgroundColor: '#1a1744' }}
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value} className="bg-navy-900 text-white">{method.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-navy-300 hover:bg-white/5 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Add Notes
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-navy-300 hover:bg-white/5 transition-colors text-sm">
                <ImagePlus className="w-4 h-4" />
                Add Image
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-navy-300 hover:bg-white/5 transition-colors text-sm">
                <File className="w-4 h-4" />
                Add Document
              </button>
            </div>

            {/* Description Field */}
            {showDescription && (
              <div>
                <label className="block text-xs text-navy-400 mb-1">Notes / Description</label>
                <textarea
                  value={invoice.description}
                  onChange={(e) => setInvoice({ ...invoice, description: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Add any notes or description..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Summary */}
        <div className="space-y-4">
          <div className="glass-card p-4 space-y-4 xl:sticky xl:top-20">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">Bill Summary</h3>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy-300">Subtotal</span>
              <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
            </div>

            {/* Overall Discount */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <label className="block text-xs text-navy-400">Discount</label>
              <div className="flex gap-2">
                <select
                  value={invoice.discount_type}
                  onChange={(e) => updateDiscount(e.target.value, invoice.discount_value)}
                  className="w-24 bg-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                  style={{ backgroundColor: '#2a2555' }}
                >
                  <option value="percent" className="bg-navy-800 text-white">%</option>
                  <option value="amount" className="bg-navy-800 text-white">₹</option>
                </select>
                <input
                  type="number"
                  value={invoice.discount_value}
                  onChange={(e) => updateDiscount(invoice.discount_type, e.target.value)}
                  className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                  placeholder="0"
                />
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount Applied</span>
                  <span>- {formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
            </div>

            {/* GST / Tax */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <label className="block text-xs text-navy-400">GST Rate</label>
              <select
                value={invoice.tax_rate}
                onChange={(e) => updateTaxRate(e.target.value)}
                className="w-full bg-white/5 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                style={{ backgroundColor: '#2a2555' }}
              >
                {taxRates.map(tax => (
                  <option key={tax.value} value={tax.value} className="bg-navy-800 text-white">{tax.label}</option>
                ))}
              </select>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-navy-300">GST ({invoice.tax_rate}%)</span>
                  <span className="text-white">+ {formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
            </div>

            {/* Round Off */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roundOff}
                  onChange={(e) => {
                    setRoundOff(e.target.checked)
                    const totals = calculateTotals(invoice.items, invoice.discount_type, invoice.discount_value, invoice.tax_rate)
                    setInvoice({ ...invoice, ...totals })
                  }}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-navy-300">Round Off</span>
              </label>
              <span className="text-sm text-navy-300">
                {invoice.round_off >= 0 ? '+' : ''}{invoice.round_off.toFixed(2)}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gold-400/30">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-gold-400">
                {formatCurrency(Math.round(invoice.total_amount))}
              </span>
            </div>

            {/* Credit Mode - Amount Paid */}
            {invoiceType === 'credit' && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-xs text-navy-400 mb-1">Amount Paid</label>
                  <input
                    type="number"
                    value={invoice.amount_paid}
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0
                      setInvoice({
                        ...invoice,
                        amount_paid: paid,
                        balance_due: invoice.total_amount - paid,
                        payment_status: paid >= invoice.total_amount ? 'paid' : paid > 0 ? 'partial' : 'pending'
                      })
                    }}
                    className="w-full bg-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-gold-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-400">Balance Due</span>
                  <span className="text-lg font-semibold text-red-400">
                    {formatCurrency(invoice.balance_due)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => setShowPDFPreview(true)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Preview Invoice
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false)
          setShowQuickCustomerForm(false)
        }}
        title="Select Customer"
        size="md"
      >
        <div className="space-y-4">
          {!showQuickCustomerForm ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="input-field pl-10"
                  autoFocus
                />
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => setShowQuickCustomerForm(true)}
                className="w-full p-4 border-2 border-dashed border-gold-400/50 rounded-xl text-gold-400 hover:bg-gold-400/10 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Quick Add New Customer (Not in List)
              </button>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="w-full p-4 text-left bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-sm text-navy-300">{customer.phone}</p>
                    {customer.address && (
                      <p className="text-xs text-navy-400 mt-1">{customer.address}</p>
                    )}
                  </button>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-navy-400 mb-2">No customers found</p>
                    <button
                      onClick={() => setShowQuickCustomerForm(true)}
                      className="text-gold-400 hover:underline text-sm"
                    >
                      Click here to add a new customer
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Quick Customer Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Quick Add Customer</h3>
                <button
                  onClick={() => setShowQuickCustomerForm(false)}
                  className="text-navy-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-navy-400 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={quickCustomer.name}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. John Doe"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={quickCustomer.phone}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, phone: e.target.value })}
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={quickCustomer.email}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, email: e.target.value })}
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-navy-400 mb-1">Address</label>
                  <textarea
                    value={quickCustomer.address}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, address: e.target.value })}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={quickCustomer.gst_number}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, gst_number: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={quickCustomer.pan_number}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, pan_number: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleQuickCustomerSave}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save & Select Customer
                </button>
                <button
                  onClick={() => setShowQuickCustomerForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-navy-400 text-center">
                This customer will be saved to your customer list
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false)
          setShowQuickProductForm(false)
        }}
        title="Add Product"
        size="lg"
      >
        <div className="space-y-4">
          {!showQuickProductForm ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="input-field pl-10"
                  autoFocus
                />
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => setShowQuickProductForm(true)}
                className="w-full p-4 border-2 border-dashed border-gold-400/50 rounded-xl text-gold-400 hover:bg-gold-400/10 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Quick Add New Product (Not in List)
              </button>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="w-full p-4 text-left bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-sm text-navy-300">
                          {product.category} • {product.purity} • {product.weight}g
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold-400 font-semibold">
                          {formatCurrency(product.selling_price)}
                        </p>
                        <p className="text-xs text-navy-400">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-navy-400 mb-2">No products found</p>
                    <button
                      onClick={() => setShowQuickProductForm(true)}
                      className="text-gold-400 hover:underline text-sm"
                    >
                      Click here to add a new product
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Quick Product Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Quick Add Product</h3>
                <button
                  onClick={() => setShowQuickProductForm(false)}
                  className="text-navy-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-navy-400 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={quickProduct.name}
                    onChange={(e) => setQuickProduct({ ...quickProduct, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Gold Ring 22K"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">Category</label>
                  <select
                    value={quickProduct.category}
                    onChange={(e) => setQuickProduct({ ...quickProduct, category: e.target.value })}
                    className="input-field"
                    style={{ backgroundColor: '#1a1744' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-navy-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">Purity</label>
                  <select
                    value={quickProduct.purity}
                    onChange={(e) => setQuickProduct({ ...quickProduct, purity: e.target.value })}
                    className="input-field"
                    style={{ backgroundColor: '#1a1744' }}
                  >
                    {purityOptions.map(p => (
                      <option key={p.value} value={p.value} className="bg-navy-900 text-white">{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">Weight (grams)</label>
                  <input
                    type="number"
                    value={quickProduct.weight}
                    onChange={(e) => setQuickProduct({ ...quickProduct, weight: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={quickProduct.selling_price}
                    onChange={(e) => setQuickProduct({ ...quickProduct, selling_price: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={quickProduct.hsn_code}
                    onChange={(e) => setQuickProduct({ ...quickProduct, hsn_code: e.target.value })}
                    className="input-field"
                    placeholder="7113"
                  />
                </div>

                <div>
                  <label className="block text-xs text-navy-400 mb-1">Making Charges</label>
                  <input
                    type="number"
                    value={quickProduct.making_charges}
                    onChange={(e) => setQuickProduct({ ...quickProduct, making_charges: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleQuickProductSave}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save & Add to Invoice
                </button>
                <button
                  onClick={() => setShowQuickProductForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-navy-400 text-center">
                This product will be saved to your inventory
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        title="Invoice Preview"
        size="full"
      >
        <InvoicePDF invoice={invoice} settings={settings} onClose={() => setShowPDFPreview(false)} />
      </Modal>
    </div>
  )
}
