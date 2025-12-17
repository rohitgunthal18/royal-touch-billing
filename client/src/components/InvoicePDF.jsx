import { useRef } from 'react'
import { Download, Printer, Share2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/format'

export default function InvoicePDF({ invoice, settings, onClose }) {
  const printRef = useRef(null)

  const handlePrint = () => {
    const printContent = printRef.current
    const printWindow = window.open('', '_blank')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            ${getInvoiceStyles()}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const handleDownload = () => {
    const printContent = printRef.current
    const printWindow = window.open('', '_blank')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            ${getInvoiceStyles()}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  const getInvoiceStyles = () => `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, Helvetica, sans-serif; 
      color: #000;
      line-height: 1.3;
      background: white;
      font-size: 11px;
    }
    .invoice-page { 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 15px;
      background: white;
    }
    .invoice-title {
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: #1a365d;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #1a365d;
    }
    .header-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: #f7f7f7;
      border: 1px solid #ddd;
      margin-bottom: 10px;
    }
    .logo-img {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    .logo-placeholder {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #d4a853, #b8860b);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
      font-weight: bold;
    }
    .company-info h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1a365d;
      margin-bottom: 3px;
    }
    .company-info p {
      font-size: 11px;
      color: #333;
      margin: 1px 0;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid #ddd;
      margin-bottom: 10px;
    }
    .details-box {
      padding: 8px 10px;
    }
    .details-box.left {
      border-right: 1px solid #ddd;
    }
    .details-label {
      font-weight: 600;
      font-size: 10px;
      color: #1a365d;
      background: #e8e8e8;
      padding: 4px 8px;
      margin: -8px -10px 6px -10px;
    }
    .details-content {
      font-size: 11px;
      color: #000;
    }
    .details-content strong {
      font-weight: 600;
    }
    
    /* Compact Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      font-size: 10px;
    }
    .items-table th {
      background: #4a5568;
      color: white;
      padding: 6px 5px;
      text-align: left;
      font-weight: 600;
      font-size: 9px;
      border: 1px solid #4a5568;
    }
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    .items-table th.center,
    .items-table td.center {
      text-align: center;
    }
    .items-table th.right,
    .items-table td.right {
      text-align: right;
    }
    .items-table td {
      padding: 5px;
      border: 1px solid #ddd;
      vertical-align: middle;
      color: #000;
    }
    .items-table tbody tr:nth-child(even) {
      background: #f9f9f9;
    }
    .total-row {
      background: #e8e8e8 !important;
      font-weight: 600;
    }
    .total-row td {
      border-top: 2px solid #4a5568;
      color: #000;
    }
    
    /* Compact Summary Section */
    .summary-section {
      border: 1px solid #ddd;
      border-top: none;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 10px;
      border-bottom: 1px solid #ddd;
      font-size: 11px;
      color: #000;
    }
    .summary-row:last-child {
      border-bottom: none;
    }
    .summary-row.total {
      font-weight: 700;
      font-size: 12px;
      background: #f0f0f0;
    }
    
    /* Amount in Words */
    .amount-words {
      background: #fffbeb;
      border: 1px solid #f59e0b;
      padding: 6px 10px;
      margin: 8px 0;
      font-size: 10px;
      color: #000;
    }
    .amount-words strong {
      color: #92400e;
    }
    
    /* Payment Summary */
    .payment-summary {
      border: 1px solid #ddd;
      margin-bottom: 8px;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 10px;
      border-bottom: 1px solid #ddd;
      font-size: 11px;
      color: #000;
    }
    .payment-row:last-child {
      border-bottom: none;
    }
    .payment-row.saved {
      color: #059669;
      font-weight: 600;
    }
    
    /* Terms */
    .terms-section {
      background: #eff6ff;
      border: 1px solid #93c5fd;
      padding: 8px 10px;
      margin-bottom: 8px;
    }
    .terms-title {
      font-weight: 600;
      font-size: 10px;
      color: #1e40af;
      margin-bottom: 3px;
    }
    .terms-text {
      font-size: 10px;
      color: #1e40af;
    }
    
    /* Signature */
    .signature-section {
      text-align: right;
      padding: 12px;
      border: 1px solid #ddd;
    }
    .signature-box {
      display: inline-block;
      text-align: center;
      min-width: 160px;
    }
    .signature-label {
      font-weight: 600;
      font-size: 11px;
      color: #000;
      margin-bottom: 25px;
    }
    .signature-img {
      height: 35px;
      margin-bottom: 5px;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      margin-bottom: 3px;
      min-height: 25px;
    }
    .signature-text {
      font-size: 10px;
      color: #2563eb;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .invoice-page { padding: 10px; max-width: 100%; }
    }
  `

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    if (num === 0) return 'Zero'
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '')
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '')
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '')
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '')
  }

  const totalAmount = Math.round(invoice.total_amount || 0)
  const paise = Math.round(((invoice.total_amount || 0) - totalAmount) * 100)
  const amountInWords = numberToWords(Math.abs(totalAmount)) + ' Rupees' + (paise > 0 ? ' and ' + numberToWords(paise) + ' Paisa' : '') + ' only'

  // Calculate totals
  const itemsTotal = invoice.items?.reduce((sum, item) => sum + (item.total || item.quantity * item.unit_price || 0), 0) || 0
  const totalDiscount = invoice.discount_amount || 0
  const youSaved = totalDiscount

  // Get logo URL - handle both base64 and file path
  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('data:')) return url
    if (url.startsWith('/uploads')) return `http://localhost:3001${url}`
    return url
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end no-print">
        <button
          onClick={handlePrint}
          className="btn-primary flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Invoice
        </button>
        <button 
          onClick={handleDownload}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
        <button className="btn-secondary flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-premium max-h-[70vh] overflow-y-auto">
        <div ref={printRef} style={{ padding: '15px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', fontSize: '11px', background: 'white' }}>
          
          {/* Title */}
          <h1 style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a365d',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '2px solid #1a365d'
          }}>
            Tax Invoice
          </h1>

          {/* Header with Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            background: '#f7f7f7',
            border: '1px solid #ddd',
            marginBottom: '10px'
          }}>
            {getImageUrl(settings.logo_url) ? (
              <img
                src={getImageUrl(settings.logo_url)}
                alt="Logo"
                style={{ width: '60px', height: '60px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #d4a853, #b8860b)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '22px',
                fontWeight: 'bold'
              }}>
                {(settings.business_name || 'J')[0]}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a365d', marginBottom: '3px' }}>
                {settings.business_name || 'Your Business Name'}
              </h2>
              <p style={{ fontSize: '11px', color: '#333', margin: '1px 0' }}>
                Phone: {settings.business_phone || 'N/A'}
              </p>
              {settings.business_address && (
                <p style={{ fontSize: '11px', color: '#333', margin: '1px 0' }}>{settings.business_address}</p>
              )}
            </div>
          </div>

          {/* Bill To & Invoice Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1px solid #ddd',
            marginBottom: '10px'
          }}>
            {/* Bill To */}
            <div style={{ padding: '8px 10px', borderRight: '1px solid #ddd' }}>
              <div style={{
                fontWeight: '600',
                fontSize: '10px',
                color: '#1a365d',
                background: '#e8e8e8',
                padding: '4px 8px',
                margin: '-8px -10px 6px -10px'
              }}>
                Bill To:
              </div>
              <div style={{ fontSize: '11px', color: '#000' }}>
                <strong>{invoice.customer_name || 'Walk-in Customer'}</strong>
                {invoice.customer_phone && (
                  <p style={{ margin: '2px 0', color: '#000' }}>Contact No: {invoice.customer_phone}</p>
                )}
                {invoice.customer_address && (
                  <p style={{ margin: '2px 0', color: '#000' }}>{invoice.customer_address}</p>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div style={{ padding: '8px 10px' }}>
              <div style={{
                fontWeight: '600',
                fontSize: '10px',
                color: '#1a365d',
                background: '#e8e8e8',
                padding: '4px 8px',
                margin: '-8px -10px 6px -10px'
              }}>
                Invoice Details:
              </div>
              <div style={{ fontSize: '11px', color: '#000' }}>
                <p style={{ margin: '2px 0' }}>No: <strong style={{ color: '#2563eb' }}>{invoice.invoice_number?.replace('INV-', '') || '1'}</strong></p>
                <p style={{ margin: '2px 0' }}>Date: <strong>{formatDate(invoice.invoice_date)}</strong></p>
              </div>
            </div>
          </div>

          {/* Compact Items Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '0',
            fontSize: '10px'
          }}>
            <thead>
              <tr style={{ background: '#4a5568', color: 'white' }}>
                <th style={{ padding: '6px 5px', border: '1px solid #4a5568', fontWeight: '600', fontSize: '9px', textAlign: 'center', width: '30px' }}>#</th>
                <th style={{ padding: '6px 5px', border: '1px solid #4a5568', fontWeight: '600', fontSize: '9px', textAlign: 'left' }}>Item name</th>
                <th style={{ padding: '6px 5px', border: '1px solid #4a5568', fontWeight: '600', fontSize: '9px', textAlign: 'center', width: '60px' }}>HSN/SAC</th>
                <th style={{ padding: '6px 5px', border: '1px solid #4a5568', fontWeight: '600', fontSize: '9px', textAlign: 'center', width: '50px' }}>Qty</th>
                <th style={{ padding: '6px 5px', border: '1px solid #4a5568', fontWeight: '600', fontSize: '9px', textAlign: 'center', width: '50px' }}>Unit</th>
                <th style={{ padding: '6px 5px', border: '1px solid #4a5568', fontWeight: '600', fontSize: '9px', textAlign: 'right', width: '90px' }}>Price/Unit(₹)</th>
                <th style={{ padding: '6px 5px', border: '1px solid #4a5568', fontWeight: '600', fontSize: '9px', textAlign: 'right', width: '90px' }}>Amount(₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                  <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center', color: '#000' }}>{index + 1}</td>
                  <td style={{ padding: '5px', border: '1px solid #ddd', fontWeight: '500', color: '#000' }}>{item.product_name}</td>
                  <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center', color: '#000' }}>{item.hsn_code || '-'}</td>
                  <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center', color: '#000' }}>{item.quantity}</td>
                  <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center', color: '#000', textTransform: 'uppercase' }}>{item.unit || 'PCS'}</td>
                  <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'right', color: '#000' }}>₹ {(item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'right', fontWeight: '500', color: '#000' }}>
                    ₹ {(item.total || item.quantity * item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr style={{ background: '#e8e8e8', fontWeight: '600' }}>
                <td colSpan="6" style={{ padding: '5px', border: '1px solid #ddd', borderTop: '2px solid #4a5568', color: '#000' }}>Items Total</td>
                <td style={{ padding: '5px', border: '1px solid #ddd', borderTop: '2px solid #4a5568', textAlign: 'right', color: '#000' }}>
                  ₹ {itemsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Sub Total & Summary */}
          <div style={{ border: '1px solid #ddd', borderTop: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #ddd', fontSize: '11px', color: '#000' }}>
              <span>Sub Total</span>
              <span>:</span>
              <span style={{ minWidth: '100px', textAlign: 'right' }}>₹ {(invoice.subtotal || itemsTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #ddd', fontSize: '11px', color: '#059669' }}>
                <span>Discount {invoice.discount_type === 'percent' ? `(${invoice.discount_value}%)` : ''}</span>
                <span>:</span>
                <span style={{ minWidth: '100px', textAlign: 'right' }}>- ₹ {totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {(invoice.tax_amount > 0 || invoice.tax_rate > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #ddd', fontSize: '11px', color: '#000' }}>
                <span>GST ({invoice.tax_rate || 3}%)</span>
                <span>:</span>
                <span style={{ minWidth: '100px', textAlign: 'right' }}>+ ₹ {(invoice.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {invoice.round_off !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #ddd', fontSize: '11px', color: '#666' }}>
                <span>Round Off</span>
                <span>:</span>
                <span style={{ minWidth: '100px', textAlign: 'right' }}>{invoice.round_off >= 0 ? '+' : ''}₹ {(invoice.round_off || 0).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', fontSize: '12px', fontWeight: '700', background: '#f0f0f0', color: '#000' }}>
              <span>Grand Total</span>
              <span>:</span>
              <span style={{ minWidth: '100px', textAlign: 'right' }}>₹ {(invoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Amount in Words */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #f59e0b',
            padding: '6px 10px',
            margin: '8px 0',
            fontSize: '10px',
            color: '#000'
          }}>
            <strong style={{ color: '#92400e' }}>Invoice Amount in Words:</strong><br />
            <span style={{ color: '#000' }}>{amountInWords}</span>
          </div>

          {/* Payment Summary - Without Balance */}
          <div style={{ border: '1px solid #ddd', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #ddd', fontSize: '11px', color: '#000' }}>
              <span>Received</span>
              <span>:</span>
              <span style={{ minWidth: '100px', textAlign: 'right' }}>₹ {(invoice.amount_paid || invoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {youSaved > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                <span>You Saved</span>
                <span>:</span>
                <span style={{ minWidth: '100px', textAlign: 'right' }}>₹ {youSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Terms & Conditions */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #93c5fd',
            padding: '8px 10px',
            marginBottom: '8px'
          }}>
            <div style={{ fontWeight: '600', fontSize: '10px', color: '#1e40af', marginBottom: '3px' }}>
              Terms & Conditions:
            </div>
            <div style={{ fontSize: '10px', color: '#1e40af' }}>
              {settings.invoice_footer || settings.terms_conditions || 'Thanks for doing business with us!'}
            </div>
          </div>

          {/* Signature */}
          <div style={{
            textAlign: 'right',
            padding: '12px',
            border: '1px solid #ddd'
          }}>
            <div style={{ display: 'inline-block', textAlign: 'center', minWidth: '160px' }}>
              <div style={{ fontWeight: '600', fontSize: '11px', marginBottom: '8px', color: '#000' }}>
                For {settings.business_name || 'Your Business'}:
              </div>
              {getImageUrl(settings.signature_url) ? (
                <img
                  src={getImageUrl(settings.signature_url)}
                  alt="Signature"
                  style={{ height: '35px', marginBottom: '5px' }}
                />
              ) : (
                <div style={{ height: '35px', marginBottom: '5px' }}></div>
              )}
              <div style={{ borderBottom: '1px solid #333', marginBottom: '3px', minHeight: '15px' }}></div>
              <div style={{ fontSize: '10px', color: '#2563eb' }}>Authorized Signatory</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
