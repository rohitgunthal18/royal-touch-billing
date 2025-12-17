import { Router } from 'express'
import { writeFileSync, existsSync, mkdirSync, readFileSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import db from '../database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const uploadsDir = join(__dirname, '../../uploads')

// Ensure uploads directory exists
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true })
}

const router = Router()

// Get settings
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Helper function to save base64 image
function saveBase64Image(base64Data, filename) {
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return base64Data // Return as-is if not a base64 image
  }
  
  try {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) return base64Data
    
    const ext = matches[1]
    const data = matches[2]
    const buffer = Buffer.from(data, 'base64')
    const filepath = join(uploadsDir, `${filename}.${ext}`)
    
    writeFileSync(filepath, buffer)
    return `/uploads/${filename}.${ext}`
  } catch (error) {
    console.error('Failed to save image:', error)
    return base64Data
  }
}

// Update settings
router.put('/', (req, res) => {
  try {
    let {
      business_name, business_address, business_phone, business_email,
      gst_number, pan_number, invoice_prefix, invoice_footer, terms_conditions,
      cgst_rate, sgst_rate, igst_rate, gold_rate_22k, gold_rate_24k, silver_rate,
      currency, date_format, low_stock_alert,
      bank_name, bank_account, bank_ifsc, bank_branch,
      logo_url, header_url, signature_url, invoice_theme
    } = req.body

    // Save images to files if they are base64
    if (logo_url && logo_url.startsWith('data:image')) {
      logo_url = saveBase64Image(logo_url, 'logo')
    }
    if (header_url && header_url.startsWith('data:image')) {
      header_url = saveBase64Image(header_url, 'header')
    }
    if (signature_url && signature_url.startsWith('data:image')) {
      signature_url = saveBase64Image(signature_url, 'signature')
    }

    db.prepare(`
      UPDATE settings SET
        business_name = ?, business_address = ?, business_phone = ?, business_email = ?,
        gst_number = ?, pan_number = ?, invoice_prefix = ?, invoice_footer = ?, terms_conditions = ?,
        cgst_rate = ?, sgst_rate = ?, igst_rate = ?, gold_rate_22k = ?, gold_rate_24k = ?, silver_rate = ?,
        currency = ?, date_format = ?, low_stock_alert = ?,
        bank_name = ?, bank_account = ?, bank_ifsc = ?, bank_branch = ?,
        logo_url = ?, header_url = ?, signature_url = ?, invoice_theme = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      business_name || '', business_address || '', business_phone || '', business_email || '',
      gst_number || '', pan_number || '', invoice_prefix || 'INV', invoice_footer || '', terms_conditions || '',
      cgst_rate || 1.5, sgst_rate || 1.5, igst_rate || 3, gold_rate_22k || 6850, gold_rate_24k || 7450, silver_rate || 85,
      currency || 'INR', date_format || 'DD/MM/YYYY', low_stock_alert || 5,
      bank_name || '', bank_account || '', bank_ifsc || '', bank_branch || '',
      logo_url || '', header_url || '', signature_url || '', invoice_theme || 'classic'
    )

    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get()
    res.json(settings)
  } catch (error) {
    console.error('Settings update error:', error)
    res.status(500).json({ message: error.message })
  }
})

export default router


