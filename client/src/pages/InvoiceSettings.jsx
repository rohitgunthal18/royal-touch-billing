import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Save,
  Trash2,
  FileText,
  Palette,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getSettings, updateSettings } from '../utils/api'

export default function InvoiceSettings() {
  const navigate = useNavigate()
  const logoInputRef = useRef(null)
  const headerInputRef = useRef(null)
  const signatureInputRef = useRef(null)

  const [settings, setSettings] = useState({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    gst_number: '',
    pan_number: '',
    invoice_prefix: 'INV',
    invoice_footer: 'Thank you for your business!',
    terms_conditions: '',
    bank_name: '',
    bank_account: '',
    bank_ifsc: '',
    bank_branch: '',
    logo_url: '',
    header_url: '',
    signature_url: '',
    invoice_theme: 'classic'
  })
  
  const [loading, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  // Helper to get image URL (handles both base64 and file paths)
  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('data:')) return url
    if (url.startsWith('/uploads')) return `http://localhost:3001${url}`
    return url
  }

  // Handle file input click
  const handleFileClick = (ref) => {
    if (ref.current) {
      ref.current.value = '' // Reset to allow selecting same file
      ref.current.click()
    }
  }

  const loadSettings = async () => {
    try {
      const data = await getSettings()
      if (data) {
        setSettings({ ...settings, ...data })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleImageUpload = (type, e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    // Compress image before storing
    const reader = new FileReader()
    reader.onloadend = () => {
      // Use window.Image to avoid conflict with lucide-react Image
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Max dimensions
        const maxWidth = type === 'header' ? 800 : 300
        const maxHeight = type === 'header' ? 200 : 300
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        
        setSettings(prev => ({
          ...prev,
          [`${type}_url`]: compressedBase64
        }))
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`)
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (type) => {
    setSettings({
      ...settings,
      [`${type}_url`]: ''
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      toast.success('Invoice settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const themes = [
    { id: 'classic', name: 'Classic', color: '#1e1b4b' },
    { id: 'modern', name: 'Modern', color: '#0f172a' },
    { id: 'elegant', name: 'Elegant', color: '#292524' },
    { id: 'gold', name: 'Gold Premium', color: '#78350f' }
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy-200" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Invoice Settings</h1>
            <p className="text-navy-300 mt-1">Customize your invoice appearance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-secondary flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold-400" />
              Business Logo
            </h2>
            <div className="flex items-start gap-4">
              <div
                onClick={() => handleFileClick(logoInputRef)}
                className={`w-32 h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden ${
                  getImageUrl(settings.logo_url)
                    ? 'border-gold-400/50 bg-white'
                    : 'border-white/20 hover:border-gold-400/50'
                }`}
              >
                {getImageUrl(settings.logo_url) ? (
                  <img
                    src={getImageUrl(settings.logo_url)}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-navy-400 mx-auto mb-2" />
                    <p className="text-xs text-navy-400">Click to Upload</p>
                  </div>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={(e) => handleImageUpload('logo', e)}
                style={{ display: 'none' }}
              />
              <div className="flex-1">
                <p className="text-sm text-navy-300 mb-2">
                  Upload your business logo (PNG, JPG). Max 2MB.
                </p>
                <p className="text-xs text-navy-400 mb-3">
                  Recommended size: 200x200 pixels
                </p>
                <button
                  type="button"
                  onClick={() => handleFileClick(logoInputRef)}
                  className="px-4 py-2 bg-gold-500/20 text-gold-400 rounded-lg text-sm hover:bg-gold-500/30 transition-colors mb-2"
                >
                  Choose File
                </button>
                {getImageUrl(settings.logo_url) && (
                  <button
                    type="button"
                    onClick={() => removeImage('logo')}
                    className="text-red-400 text-sm flex items-center gap-1 hover:underline ml-3"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Header Image */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-400" />
              Invoice Header Banner
            </h2>
            <div
              onClick={() => handleFileClick(headerInputRef)}
              className={`w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden ${
                getImageUrl(settings.header_url)
                  ? 'border-gold-400/50 bg-white'
                  : 'border-white/20 hover:border-gold-400/50'
              }`}
            >
              {getImageUrl(settings.header_url) ? (
                <img
                  src={getImageUrl(settings.header_url)}
                  alt="Header"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-6 h-6 text-navy-400 mx-auto mb-1" />
                  <p className="text-xs text-navy-400">Click to Upload Header Banner (800x150px)</p>
                </div>
              )}
            </div>
            <input
              ref={headerInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={(e) => handleImageUpload('header', e)}
              style={{ display: 'none' }}
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleFileClick(headerInputRef)}
                className="px-4 py-2 bg-gold-500/20 text-gold-400 rounded-lg text-sm hover:bg-gold-500/30 transition-colors"
              >
                Choose File
              </button>
              {getImageUrl(settings.header_url) && (
                <button
                  type="button"
                  onClick={() => removeImage('header')}
                  className="text-red-400 text-sm flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Authorized Signature</h2>
            <div className="flex items-start gap-4">
              <div
                onClick={() => handleFileClick(signatureInputRef)}
                className={`w-40 h-20 rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden ${
                  getImageUrl(settings.signature_url)
                    ? 'border-gold-400/50 bg-white'
                    : 'border-white/20 hover:border-gold-400/50 bg-white/5'
                }`}
              >
                {getImageUrl(settings.signature_url) ? (
                  <img
                    src={getImageUrl(settings.signature_url)}
                    alt="Signature"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-xs text-navy-400">Click to Upload</p>
                )}
              </div>
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={(e) => handleImageUpload('signature', e)}
                style={{ display: 'none' }}
              />
              <div>
                <button
                  type="button"
                  onClick={() => handleFileClick(signatureInputRef)}
                  className="px-4 py-2 bg-gold-500/20 text-gold-400 rounded-lg text-sm hover:bg-gold-500/30 transition-colors mb-2"
                >
                  Choose File
                </button>
                {getImageUrl(settings.signature_url) && (
                  <button
                    type="button"
                    onClick={() => removeImage('signature')}
                    className="text-red-400 text-sm flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Theme */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-gold-400" />
              Invoice Theme
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSettings({ ...settings, invoice_theme: theme.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.invoice_theme === theme.id
                      ? 'border-gold-400 bg-gold-400/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded-lg mb-2"
                    style={{ backgroundColor: theme.color }}
                  />
                  <p className="text-sm text-white">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Bank Details (for Invoice)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-navy-300 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={settings.bank_name}
                  onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                  className="input-field"
                  placeholder="Bank Name"
                />
              </div>
              <div>
                <label className="block text-sm text-navy-300 mb-2">Account Number</label>
                <input
                  type="text"
                  value={settings.bank_account}
                  onChange={(e) => setSettings({ ...settings, bank_account: e.target.value })}
                  className="input-field"
                  placeholder="Account Number"
                />
              </div>
              <div>
                <label className="block text-sm text-navy-300 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={settings.bank_ifsc}
                  onChange={(e) => setSettings({ ...settings, bank_ifsc: e.target.value })}
                  className="input-field"
                  placeholder="IFSC Code"
                />
              </div>
              <div>
                <label className="block text-sm text-navy-300 mb-2">Branch</label>
                <input
                  type="text"
                  value={settings.bank_branch}
                  onChange={(e) => setSettings({ ...settings, bank_branch: e.target.value })}
                  className="input-field"
                  placeholder="Branch Name"
                />
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Invoice Footer & Terms</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-navy-300 mb-2">Invoice Footer Text</label>
                <input
                  type="text"
                  value={settings.invoice_footer}
                  onChange={(e) => setSettings({ ...settings, invoice_footer: e.target.value })}
                  className="input-field"
                  placeholder="Thank you for your business!"
                />
              </div>
              <div>
                <label className="block text-sm text-navy-300 mb-2">Terms & Conditions</label>
                <textarea
                  value={settings.terms_conditions}
                  onChange={(e) => setSettings({ ...settings, terms_conditions: e.target.value })}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="glass-card p-6 sticky top-24">
          <h2 className="text-lg font-semibold text-white mb-4">Invoice Preview</h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-premium" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px' }}>
            <div className="p-3">
              {/* Title */}
              <h1 className="text-center text-base font-semibold mb-2 pb-2 border-b-2" style={{ color: '#1a365d', borderColor: '#1a365d' }}>
                Tax Invoice
              </h1>

              {/* Header with Logo */}
              <div className="flex items-center gap-3 p-2 mb-2" style={{ background: '#f7f7f7', border: '1px solid #ddd' }}>
                {getImageUrl(settings.logo_url) ? (
                  <img
                    src={getImageUrl(settings.logo_url)}
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold" style={{ background: 'linear-gradient(135deg, #d4a853, #b8860b)' }}>
                    {(settings.business_name || 'J')[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-bold" style={{ color: '#1a365d' }}>
                    {settings.business_name || 'Your Business Name'}
                  </h2>
                  <p className="text-gray-600 text-xs">Phone: {settings.business_phone || 'N/A'}</p>
                  {settings.business_address && (
                    <p className="text-gray-600 text-xs">{settings.business_address}</p>
                  )}
                </div>
              </div>

              {/* Bill To & Invoice Details Grid */}
              <div className="grid grid-cols-2 mb-2" style={{ border: '1px solid #ddd' }}>
                {/* Bill To */}
                <div className="p-2" style={{ borderRight: '1px solid #ddd' }}>
                  <div className="font-semibold text-xs px-2 py-1 -mx-2 -mt-2 mb-2" style={{ color: '#1a365d', background: '#e8e8e8' }}>
                    Bill To:
                  </div>
                  <div className="text-xs">
                    <strong className="text-black">Customer Name</strong>
                    <p className="text-black">Contact No: +91 98765 43210</p>
                    <p className="text-black">Customer Address</p>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="p-2">
                  <div className="font-semibold text-xs px-2 py-1 -mx-2 -mt-2 mb-2" style={{ color: '#1a365d', background: '#e8e8e8' }}>
                    Invoice Details:
                  </div>
                  <div className="text-xs">
                    <p className="text-black">No: <strong className="text-blue-600">2412-0001</strong></p>
                    <p className="text-black">Date: <strong>18/12/2025</strong></p>
                  </div>
                </div>
              </div>

              {/* Compact Items Table */}
              <table className="w-full mb-0" style={{ borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr style={{ background: '#4a5568', color: 'white' }}>
                    <th className="p-1 text-center font-semibold" style={{ border: '1px solid #4a5568', width: '20px' }}>#</th>
                    <th className="p-1 text-left font-semibold" style={{ border: '1px solid #4a5568' }}>Item name</th>
                    <th className="p-1 text-center font-semibold" style={{ border: '1px solid #4a5568', width: '40px' }}>HSN</th>
                    <th className="p-1 text-center font-semibold" style={{ border: '1px solid #4a5568', width: '30px' }}>Qty</th>
                    <th className="p-1 text-center font-semibold" style={{ border: '1px solid #4a5568', width: '35px' }}>Unit</th>
                    <th className="p-1 text-right font-semibold" style={{ border: '1px solid #4a5568', width: '60px' }}>Price(₹)</th>
                    <th className="p-1 text-right font-semibold" style={{ border: '1px solid #4a5568', width: '60px' }}>Amount(₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: 'white' }}>
                    <td className="p-1 text-center text-black" style={{ border: '1px solid #ddd' }}>1</td>
                    <td className="p-1 text-black font-medium" style={{ border: '1px solid #ddd' }}>Gold Ring 22K</td>
                    <td className="p-1 text-center text-black" style={{ border: '1px solid #ddd' }}>7113</td>
                    <td className="p-1 text-center text-black" style={{ border: '1px solid #ddd' }}>1</td>
                    <td className="p-1 text-center text-black" style={{ border: '1px solid #ddd' }}>PCS</td>
                    <td className="p-1 text-right text-black" style={{ border: '1px solid #ddd' }}>₹ 55,000</td>
                    <td className="p-1 text-right text-black font-medium" style={{ border: '1px solid #ddd' }}>₹ 55,000</td>
                  </tr>
                  {/* Total Row */}
                  <tr style={{ background: '#e8e8e8', fontWeight: '600' }}>
                    <td colSpan="6" className="p-1 text-black" style={{ border: '1px solid #ddd', borderTop: '2px solid #4a5568' }}>Items Total</td>
                    <td className="p-1 text-right text-black" style={{ border: '1px solid #ddd', borderTop: '2px solid #4a5568' }}>₹ 55,000</td>
                  </tr>
                </tbody>
              </table>

              {/* Sub Total & Total */}
              <div style={{ border: '1px solid #ddd', borderTop: 'none' }}>
                <div className="flex justify-between px-2 py-1 text-xs text-black" style={{ borderBottom: '1px solid #ddd' }}>
                  <span>Sub Total</span>
                  <span>:</span>
                  <span className="text-right" style={{ minWidth: '70px' }}>₹ 55,000.00</span>
                </div>
                <div className="flex justify-between px-2 py-1 text-xs text-black" style={{ borderBottom: '1px solid #ddd' }}>
                  <span>GST (3%)</span>
                  <span>:</span>
                  <span className="text-right" style={{ minWidth: '70px' }}>+ ₹ 1,650.00</span>
                </div>
                <div className="flex justify-between px-2 py-1 text-xs font-bold text-black" style={{ background: '#f0f0f0' }}>
                  <span>Grand Total</span>
                  <span>:</span>
                  <span className="text-right" style={{ minWidth: '70px' }}>₹ 56,650.00</span>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="px-2 py-1 my-2" style={{ background: '#fffbeb', border: '1px solid #f59e0b', fontSize: '9px' }}>
                <strong style={{ color: '#92400e' }}>Invoice Amount in Words:</strong><br />
                <span className="text-black">Fifty Five Thousand Rupees only</span>
              </div>

              {/* Payment Summary */}
              <div className="mb-2" style={{ border: '1px solid #ddd' }}>
                <div className="flex justify-between px-2 py-1 text-xs text-black" style={{ borderBottom: '1px solid #ddd' }}>
                  <span>Received</span>
                  <span>:</span>
                  <span className="text-right" style={{ minWidth: '70px' }}>₹ 55,000.00</span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="px-2 py-1 mb-2" style={{ background: '#eff6ff', border: '1px solid #93c5fd' }}>
                <div className="font-semibold text-xs" style={{ color: '#1e40af', marginBottom: '2px' }}>
                  Terms & Conditions:
                </div>
                <div className="text-xs" style={{ color: '#1e40af' }}>
                  {settings.invoice_footer || settings.terms_conditions || 'Thanks for doing business with us!'}
                </div>
              </div>

              {/* Signature */}
              <div className="text-right p-2" style={{ border: '1px solid #ddd' }}>
                <div className="inline-block text-center" style={{ minWidth: '120px' }}>
                  <div className="font-semibold text-xs mb-1 text-black">
                    For {settings.business_name || 'Your Business'}:
                  </div>
                  {getImageUrl(settings.signature_url) ? (
                    <img
                      src={getImageUrl(settings.signature_url)}
                      alt="Signature"
                      className="h-8 mx-auto mb-1 object-contain"
                    />
                  ) : (
                    <div className="h-8 mb-1"></div>
                  )}
                  <div className="border-b border-gray-800 mb-1 h-3"></div>
                  <div className="text-xs" style={{ color: '#2563eb' }}>Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

