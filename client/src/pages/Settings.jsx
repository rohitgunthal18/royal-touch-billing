import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building,
  Save,
  Upload,
  IndianRupee,
  Palette,
  Bell,
  Shield,
  Database,
  Printer,
  FileText,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getSettings, updateSettings } from '../utils/api'

export default function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('business')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Business Info
    business_name: 'JewelBill Pro',
    business_address: '',
    business_phone: '',
    business_email: '',
    gst_number: '',
    pan_number: '',
    
    // Invoice Settings
    invoice_prefix: 'INV',
    invoice_footer: 'Thank you for your business!',
    terms_conditions: '',
    
    // Tax Settings
    cgst_rate: 1.5,
    sgst_rate: 1.5,
    igst_rate: 3,
    
    // Gold/Silver Rates
    gold_rate_22k: 6850,
    gold_rate_24k: 7450,
    silver_rate: 85,
    
    // Preferences
    currency: 'INR',
    date_format: 'DD/MM/YYYY',
    low_stock_alert: 5
  })

  useEffect(() => {
    loadSettings()
  }, [])

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

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'business', name: 'Business Info', icon: Building },
    { id: 'invoice', name: 'Invoice', icon: Printer },
    { id: 'tax', name: 'Tax & Rates', icon: IndianRupee },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'backup', name: 'Backup', icon: Database }
  ]

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-xl gold-gradient flex items-center justify-center">
          <Building className="w-10 h-10 text-navy-950" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Business Logo</h3>
          <button className="text-gold-400 text-sm hover:underline flex items-center gap-1 mt-1">
            <Upload className="w-4 h-4" /> Upload Logo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-navy-300 mb-2">Business Name *</label>
          <input
            type="text"
            value={settings.business_name}
            onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
            className="input-field"
            placeholder="Your Jewelry Shop Name"
          />
        </div>
        <div>
          <label className="block text-sm text-navy-300 mb-2">Phone Number</label>
          <input
            type="tel"
            value={settings.business_phone}
            onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
            className="input-field"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div>
          <label className="block text-sm text-navy-300 mb-2">Email</label>
          <input
            type="email"
            value={settings.business_email}
            onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
            className="input-field"
            placeholder="business@email.com"
          />
        </div>
        <div>
          <label className="block text-sm text-navy-300 mb-2">GST Number</label>
          <input
            type="text"
            value={settings.gst_number}
            onChange={(e) => setSettings({ ...settings, gst_number: e.target.value })}
            className="input-field"
            placeholder="22XXXXX1234X1Z5"
          />
        </div>
        <div>
          <label className="block text-sm text-navy-300 mb-2">PAN Number</label>
          <input
            type="text"
            value={settings.pan_number}
            onChange={(e) => setSettings({ ...settings, pan_number: e.target.value })}
            className="input-field"
            placeholder="XXXXX1234X"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-navy-300 mb-2">Business Address</label>
          <textarea
            value={settings.business_address}
            onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
            rows={3}
            className="input-field resize-none"
            placeholder="Full business address"
          />
        </div>
      </div>
    </div>
  )

  const renderInvoiceSettings = () => (
    <div className="space-y-6">
      {/* Quick Link to Invoice Settings */}
      <div
        onClick={() => navigate('/sales/invoice-settings')}
        className="glass-card-light p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl gold-gradient">
            <FileText className="w-6 h-6 text-navy-950" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Invoice Customization</h3>
            <p className="text-sm text-navy-300">Upload logo, header banner, signature & customize invoice appearance</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gold-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-navy-300 mb-2">Invoice Prefix</label>
          <input
            type="text"
            value={settings.invoice_prefix}
            onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
            className="input-field"
            placeholder="INV"
          />
        </div>
        <div>
          <label className="block text-sm text-navy-300 mb-2">Date Format</label>
          <select
            value={settings.date_format}
            onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
            className="input-field"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-navy-300 mb-2">Invoice Footer Text</label>
          <input
            type="text"
            value={settings.invoice_footer}
            onChange={(e) => setSettings({ ...settings, invoice_footer: e.target.value })}
            className="input-field"
            placeholder="Thank you for your business!"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-navy-300 mb-2">Terms & Conditions</label>
          <textarea
            value={settings.terms_conditions}
            onChange={(e) => setSettings({ ...settings, terms_conditions: e.target.value })}
            rows={4}
            className="input-field resize-none"
            placeholder="Enter your terms and conditions..."
          />
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Invoice Preview</h3>
        <div className="bg-white rounded-xl p-6 text-navy-950">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{settings.business_name || 'Your Business'}</h2>
              <p className="text-sm text-gray-600 mt-1">{settings.business_address || 'Business Address'}</p>
              <p className="text-sm text-gray-600">{settings.business_phone || 'Phone Number'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Invoice #{settings.invoice_prefix}-2412-0001</p>
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="border-t pt-4 text-sm text-gray-500 text-center">
            {settings.invoice_footer || 'Thank you for your business!'}
          </div>
        </div>
      </div>
    </div>
  )

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">GST Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-navy-300 mb-2">CGST Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.cgst_rate}
              onChange={(e) => setSettings({ ...settings, cgst_rate: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-300 mb-2">SGST Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.sgst_rate}
              onChange={(e) => setSettings({ ...settings, sgst_rate: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-300 mb-2">IGST Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.igst_rate}
              onChange={(e) => setSettings({ ...settings, igst_rate: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Metal Rates (per gram)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-navy-300 mb-2">Gold 22K (₹)</label>
            <input
              type="number"
              value={settings.gold_rate_22k}
              onChange={(e) => setSettings({ ...settings, gold_rate_22k: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-300 mb-2">Gold 24K (₹)</label>
            <input
              type="number"
              value={settings.gold_rate_24k}
              onChange={(e) => setSettings({ ...settings, gold_rate_24k: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-navy-300 mb-2">Silver (₹)</label>
            <input
              type="number"
              value={settings.silver_rate}
              onChange={(e) => setSettings({ ...settings, silver_rate: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>
        <p className="text-xs text-navy-400 mt-4">
          * These rates will be used for reference. Update daily for accurate pricing.
        </p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Stock Alerts</h3>
        <div>
          <label className="block text-sm text-navy-300 mb-2">Low Stock Alert Threshold</label>
          <input
            type="number"
            min="1"
            value={settings.low_stock_alert}
            onChange={(e) => setSettings({ ...settings, low_stock_alert: parseInt(e.target.value) })}
            className="input-field w-32"
          />
          <p className="text-xs text-navy-400 mt-2">
            Alert when stock falls below this quantity
          </p>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-4">
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Low Stock Alerts</p>
          <p className="text-sm text-navy-300">Get notified when products run low</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" defaultChecked className="sr-only peer" />
          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
        </label>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Payment Reminders</p>
          <p className="text-sm text-navy-300">Remind customers of pending payments</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" defaultChecked className="sr-only peer" />
          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
        </label>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Daily Sales Summary</p>
          <p className="text-sm text-navy-300">Receive daily sales report via email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
        </label>
      </div>
    </div>
  )

  const renderBackup = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Backup</h3>
        <p className="text-navy-300 mb-4">
          Create a backup of your database including all invoices, customers, products, and settings.
        </p>
        <button className="btn-primary flex items-center gap-2">
          <Database className="w-5 h-5" />
          Download Backup
        </button>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Restore Database</h3>
        <p className="text-navy-300 mb-4">
          Restore your data from a previous backup file.
        </p>
        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-navy-400 mx-auto mb-3" />
          <p className="text-navy-300">Drop backup file here or click to upload</p>
          <input type="file" className="hidden" accept=".db,.sqlite" />
        </div>
      </div>

      <div className="glass-card p-6 border-l-4 border-amber-400">
        <div className="flex gap-3">
          <Shield className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="text-white font-medium">Data Security</h4>
            <p className="text-sm text-navy-300 mt-1">
              Your data is stored locally on your device. We recommend creating regular backups
              to prevent data loss. For cloud backup and multi-device sync, upgrade to Pro.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'business':
        return renderBusinessInfo()
      case 'invoice':
        return renderInvoiceSettings()
      case 'tax':
        return renderTaxSettings()
      case 'notifications':
        return renderNotifications()
      case 'backup':
        return renderBackup()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
          <p className="text-navy-300 mt-1">Configure your billing software</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gold-500 text-navy-950'
                : 'bg-white/5 text-navy-200 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-card p-6">
        {renderContent()}
      </div>
    </div>
  )
}


