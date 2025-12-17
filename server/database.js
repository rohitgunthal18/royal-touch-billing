import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const db = new Database(join(__dirname, '../data/jewelbill.db'))

export function initDatabase() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create tables
  db.exec(`
    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      business_name TEXT DEFAULT 'JewelBill Pro',
      business_address TEXT,
      business_phone TEXT,
      business_email TEXT,
      gst_number TEXT,
      pan_number TEXT,
      invoice_prefix TEXT DEFAULT 'INV',
      invoice_footer TEXT DEFAULT 'Thank you for your business!',
      terms_conditions TEXT,
      cgst_rate REAL DEFAULT 1.5,
      sgst_rate REAL DEFAULT 1.5,
      igst_rate REAL DEFAULT 3,
      gold_rate_22k REAL DEFAULT 6850,
      gold_rate_24k REAL DEFAULT 7450,
      silver_rate REAL DEFAULT 85,
      currency TEXT DEFAULT 'INR',
      date_format TEXT DEFAULT 'DD/MM/YYYY',
      low_stock_alert INTEGER DEFAULT 5,
      bank_name TEXT,
      bank_account TEXT,
      bank_ifsc TEXT,
      bank_branch TEXT,
      logo_url TEXT,
      header_url TEXT,
      signature_url TEXT,
      invoice_theme TEXT DEFAULT 'classic',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Customers table
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      pan_number TEXT,
      notes TEXT,
      total_purchases REAL DEFAULT 0,
      outstanding REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Suppliers table
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      bank_details TEXT,
      notes TEXT,
      total_purchases REAL DEFAULT 0,
      outstanding REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      hsn_code TEXT DEFAULT '7113',
      category TEXT,
      metal_type TEXT,
      purity TEXT,
      weight REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      cost_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      making_charges REAL DEFAULT 0,
      min_stock INTEGER DEFAULT 1,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Invoices table
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      invoice_date DATE NOT NULL,
      customer_id INTEGER,
      customer_name TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      subtotal REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      discount_type TEXT DEFAULT 'amount',
      cgst REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      igst REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      payment_status TEXT DEFAULT 'paid',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- Invoice items table
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      hsn_code TEXT,
      category TEXT,
      metal_type TEXT,
      purity TEXT,
      weight REAL DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      unit_price REAL DEFAULT 0,
      making_charges REAL DEFAULT 0,
      total REAL DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Purchases table
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_number TEXT UNIQUE NOT NULL,
      purchase_date DATE NOT NULL,
      supplier_id INTEGER,
      supplier_name TEXT,
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      payment_status TEXT DEFAULT 'paid',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- Purchase items table
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      weight REAL DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      unit_price REAL DEFAULT 0,
      total REAL DEFAULT 0,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
    );

    -- Expenses table
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      expense_date DATE NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      reference TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert default settings if not exists
    INSERT OR IGNORE INTO settings (id) VALUES (1);
  `)

  // Add sample data for demo
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get()
  if (customerCount.count === 0) {
    insertSampleData()
  }

  console.log('✅ Database initialized successfully')
}

function insertSampleData() {
  // Sample customers
  const customers = [
    { name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@email.com', address: 'Mumbai, Maharashtra' },
    { name: 'Rajesh Patel', phone: '+91 87654 32109', email: 'rajesh@email.com', address: 'Ahmedabad, Gujarat' },
    { name: 'Anita Desai', phone: '+91 76543 21098', email: 'anita@email.com', address: 'Delhi' },
    { name: 'Vikram Singh', phone: '+91 65432 10987', email: 'vikram@email.com', address: 'Jaipur, Rajasthan' },
    { name: 'Meera Reddy', phone: '+91 54321 09876', email: 'meera@email.com', address: 'Hyderabad, Telangana' }
  ]

  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)
  `)

  customers.forEach(c => insertCustomer.run(c.name, c.phone, c.email, c.address))

  // Sample suppliers
  const suppliers = [
    { name: 'Gold Traders Pvt Ltd', company_name: 'Gold Traders', phone: '+91 99999 11111' },
    { name: 'Silver Palace', company_name: 'Silver Palace Exports', phone: '+91 99999 22222' },
    { name: 'Diamond House', company_name: 'Diamond House India', phone: '+91 99999 33333' }
  ]

  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (name, company_name, phone) VALUES (?, ?, ?)
  `)

  suppliers.forEach(s => insertSupplier.run(s.name, s.company_name, s.phone))

  // Sample products
  const products = [
    { name: 'Gold Ring 22K Traditional', sku: 'GR-22K-001', category: 'Rings', metal_type: 'gold', purity: '22K', weight: 8.5, stock: 15, cost_price: 48000, selling_price: 55000, making_charges: 2500 },
    { name: 'Gold Necklace 22K Bridal', sku: 'GN-22K-001', category: 'Necklaces', metal_type: 'gold', purity: '22K', weight: 45, stock: 5, cost_price: 280000, selling_price: 320000, making_charges: 15000 },
    { name: 'Diamond Earrings 18K', sku: 'DE-18K-001', category: 'Earrings', metal_type: 'diamond', purity: '18K', weight: 4.2, stock: 10, cost_price: 85000, selling_price: 98000, making_charges: 5000 },
    { name: 'Gold Bangles Set 22K', sku: 'GB-22K-001', category: 'Bangles', metal_type: 'gold', purity: '22K', weight: 32, stock: 8, cost_price: 195000, selling_price: 225000, making_charges: 8000 },
    { name: 'Silver Anklet Pure', sku: 'SA-925-001', category: 'Anklets', metal_type: 'silver', purity: '925', weight: 25, stock: 20, cost_price: 3500, selling_price: 4500, making_charges: 500 },
    { name: 'Gold Chain 22K', sku: 'GC-22K-001', category: 'Chains', metal_type: 'gold', purity: '22K', weight: 15, stock: 12, cost_price: 95000, selling_price: 108000, making_charges: 4000 },
    { name: 'Platinum Ring', sku: 'PR-950-001', category: 'Rings', metal_type: 'platinum', purity: '950', weight: 6, stock: 6, cost_price: 45000, selling_price: 52000, making_charges: 3000 },
    { name: 'Gold Pendant Diamond', sku: 'GP-22K-001', category: 'Pendants', metal_type: 'gold', purity: '22K', weight: 5.5, stock: 18, cost_price: 42000, selling_price: 48000, making_charges: 2000 }
  ]

  const insertProduct = db.prepare(`
    INSERT INTO products (name, sku, category, metal_type, purity, weight, stock, cost_price, selling_price, making_charges)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  products.forEach(p => insertProduct.run(p.name, p.sku, p.category, p.metal_type, p.purity, p.weight, p.stock, p.cost_price, p.selling_price, p.making_charges))

  // Sample invoices
  const today = new Date()
  const invoices = [
    { number: 'INV-2412-0001', date: new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_id: 1, customer_name: 'Priya Sharma', subtotal: 55000, cgst: 825, sgst: 825, total: 56650, status: 'paid' },
    { number: 'INV-2412-0002', date: new Date(today - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_id: 2, customer_name: 'Rajesh Patel', subtotal: 320000, cgst: 4800, sgst: 4800, total: 329600, status: 'paid' },
    { number: 'INV-2412-0003', date: new Date(today - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_id: 3, customer_name: 'Anita Desai', subtotal: 98000, cgst: 1470, sgst: 1470, total: 100940, status: 'pending' },
    { number: 'INV-2412-0004', date: new Date(today - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customer_id: 4, customer_name: 'Vikram Singh', subtotal: 225000, cgst: 3375, sgst: 3375, total: 231750, status: 'paid' },
    { number: 'INV-2412-0005', date: today.toISOString().split('T')[0], customer_id: 5, customer_name: 'Meera Reddy', subtotal: 48000, cgst: 720, sgst: 720, total: 49440, status: 'paid' }
  ]

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (invoice_number, invoice_date, customer_id, customer_name, subtotal, cgst, sgst, total_amount, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  invoices.forEach(i => insertInvoice.run(i.number, i.date, i.customer_id, i.customer_name, i.subtotal, i.cgst, i.sgst, i.total, i.status))

  // Update customer totals
  db.prepare(`
    UPDATE customers SET total_purchases = (
      SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE customer_id = customers.id
    )
  `).run()

  // Sample expenses
  const expenses = [
    { category: 'Rent', description: 'Shop rent for December', amount: 35000, date: today.toISOString().split('T')[0] },
    { category: 'Utilities', description: 'Electricity bill', amount: 5500, date: today.toISOString().split('T')[0] },
    { category: 'Salaries', description: 'Staff salaries', amount: 65000, date: today.toISOString().split('T')[0] },
    { category: 'Marketing', description: 'Social media ads', amount: 8000, date: new Date(today - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
  ]

  const insertExpense = db.prepare(`
    INSERT INTO expenses (category, description, amount, expense_date) VALUES (?, ?, ?, ?)
  `)

  expenses.forEach(e => insertExpense.run(e.category, e.description, e.amount, e.date))

  console.log('✅ Sample data inserted')
}

export default db


