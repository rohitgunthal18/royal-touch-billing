// Currency formatting for Indian Rupees
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0.00'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format number with Indian numbering system
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-IN').format(num)
}

// Format weight (grams)
export function formatWeight(grams) {
  if (grams === null || grams === undefined) return '0g'
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}kg`
  }
  return `${grams.toFixed(2)}g`
}

// Format date
export function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Format date with time
export function formatDateTime(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Format percentage
export function formatPercentage(value) {
  if (value === null || value === undefined) return '0%'
  return `${value.toFixed(1)}%`
}

// Generate invoice number
export function generateInvoiceNumber(prefix = 'INV') {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}${month}-${random}`
}

// Calculate GST
export function calculateGST(amount, rate = 3) {
  const gst = (amount * rate) / 100
  return {
    cgst: gst / 2,
    sgst: gst / 2,
    igst: 0,
    total: gst,
    grandTotal: amount + gst
  }
}

// Purity options for jewelry
export const purityOptions = [
  { value: '24K', label: '24K (99.9%)', percentage: 99.9 },
  { value: '22K', label: '22K (91.6%)', percentage: 91.6 },
  { value: '18K', label: '18K (75%)', percentage: 75 },
  { value: '14K', label: '14K (58.5%)', percentage: 58.5 },
  { value: '925', label: 'Sterling Silver (92.5%)', percentage: 92.5 },
  { value: '950', label: 'Platinum (95%)', percentage: 95 },
]

// Jewelry categories
export const jewelryCategories = [
  'Rings',
  'Necklaces',
  'Earrings',
  'Bangles',
  'Bracelets',
  'Pendants',
  'Chains',
  'Anklets',
  'Nose Pins',
  'Mangalsutra',
  'Coins & Bars',
  'Other'
]

// Metal types
export const metalTypes = [
  { value: 'gold', label: 'Gold', color: '#fbbf24' },
  { value: 'silver', label: 'Silver', color: '#94a3b8' },
  { value: 'platinum', label: 'Platinum', color: '#e2e8f0' },
  { value: 'diamond', label: 'Diamond', color: '#38bdf8' },
  { value: 'other', label: 'Other', color: '#a78bfa' },
]

// Payment methods
export const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'credit', label: 'Credit (Pay Later)' },
]

// Status colors
export const statusColors = {
  paid: 'bg-emerald-500/20 text-emerald-400',
  pending: 'bg-amber-500/20 text-amber-400',
  partial: 'bg-blue-500/20 text-blue-400',
  overdue: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
}


