import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { initDatabase } from './database.js'
import dashboardRoutes from './routes/dashboard.js'
import customersRoutes from './routes/customers.js'
import suppliersRoutes from './routes/suppliers.js'
import productsRoutes from './routes/products.js'
import invoicesRoutes from './routes/invoices.js'
import purchasesRoutes from './routes/purchases.js'
import expensesRoutes from './routes/expenses.js'
import reportsRoutes from './routes/reports.js'
import settingsRoutes from './routes/settings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// CORS Configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true)
    } else {
      callback(null, true) // Allow all in case frontend URL isn't set
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// Initialize database
initDatabase()

// Health check route for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Root route - helpful message in development
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.json({ 
      status: 'Royal Touch Jewellery API is running',
      version: '1.0.0',
      endpoints: '/api'
    })
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Royal Touch Jewellery API</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0f0d2e 0%, #1e1b4b 50%, #1a1744 100%);
              color: #f0f4ff;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              text-align: center;
              background: rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              padding: 40px;
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 10px;
              background: linear-gradient(135deg, #fbbf24, #f59e0b);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              font-size: 1.1rem;
              margin: 20px 0;
              color: #a4b8fc;
            }
            a {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 30px;
              background: linear-gradient(135deg, #fbbf24, #f59e0b);
              color: #1e1b4b;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              transition: transform 0.2s;
            }
            a:hover {
              transform: translateY(-2px);
            }
            .info {
              margin-top: 30px;
              padding: 20px;
              background: rgba(251, 191, 36, 0.1);
              border-radius: 10px;
              border-left: 4px solid #fbbf24;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>💎 Royal Touch Jewellery</h1>
            <p>API Server is running successfully!</p>
            <a href="http://localhost:5173" target="_blank">
              Open Dashboard →
            </a>
            <div class="info">
              <p><strong>Development Mode</strong></p>
              <p style="font-size: 0.9rem; margin-top: 10px;">
                Frontend: <a href="http://localhost:5173" style="color: #fbbf24; text-decoration: underline; padding: 0;">http://localhost:5173</a><br>
                API: <span style="color: #fbbf24;">http://localhost:3001/api</span>
              </p>
            </div>
          </div>
        </body>
      </html>
    `)
  }
})

// API Routes
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/suppliers', suppliersRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/invoices', invoicesRoutes)
app.use('/api/purchases', purchasesRoutes)
app.use('/api/expenses', expensesRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/categories', (req, res) => {
  res.json(['Rings', 'Necklaces', 'Earrings', 'Bangles', 'Bracelets', 'Pendants', 'Chains', 'Anklets', 'Nose Pins', 'Mangalsutra', 'Coins & Bars', 'Other'])
})

// Serve static files in production (fallback for all other routes)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist')))
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   💎 Royal Touch Jewellery Server Running!       ║
  ║                                                  ║
  ║   🌐 API: http://localhost:${PORT}                  ║
  ║   📊 Dashboard: http://localhost:5173            ║
  ║   🚀 Environment: ${process.env.NODE_ENV || 'development'}                  ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
  `)
})


