import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Purchases from './pages/Purchases'
import Inventory from './pages/Inventory'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import NewInvoice from './pages/NewInvoice'
import InvoiceSettings from './pages/InvoiceSettings'

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(30, 27, 75, 0.95)',
            color: '#f0f4ff',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#fbbf24',
              secondary: '#1e1b4b',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sales/new" element={<NewInvoice />} />
          <Route path="sales/edit/:id" element={<NewInvoice />} />
          <Route path="sales/invoice-settings" element={<InvoiceSettings />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App


