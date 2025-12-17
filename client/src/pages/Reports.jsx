import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  PieChart,
  IndianRupee,
  Package,
  Users
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { formatCurrency, formatDate } from '../utils/format'
import {
  getSalesReport,
  getPurchaseReport,
  getExpenseReport,
  getProfitLossReport,
  getInventoryReport,
  getCustomerReport
} from '../utils/api'

const COLORS = ['#fbbf24', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899']

export default function Reports() {
  const [activeReport, setActiveReport] = useState('profit-loss')
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
  }, [activeReport, dateRange])

  const loadReport = async () => {
    setLoading(true)
    try {
      let data
      const params = { from: dateRange.from, to: dateRange.to }
      
      switch (activeReport) {
        case 'profit-loss':
          data = await getProfitLossReport(params)
          break
        case 'sales':
          data = await getSalesReport(params)
          break
        case 'purchases':
          data = await getPurchaseReport(params)
          break
        case 'expenses':
          data = await getExpenseReport(params)
          break
        case 'inventory':
          data = await getInventoryReport()
          break
        case 'customers':
          data = await getCustomerReport()
          break
        default:
          data = null
      }
      setReportData(data)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    { id: 'profit-loss', name: 'Profit & Loss', icon: TrendingUp },
    { id: 'sales', name: 'Sales Report', icon: BarChart3 },
    { id: 'purchases', name: 'Purchase Report', icon: Package },
    { id: 'expenses', name: 'Expense Report', icon: IndianRupee },
    { id: 'inventory', name: 'Inventory Report', icon: Package },
    { id: 'customers', name: 'Customer Report', icon: Users }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-gold-400/30">
          <p className="text-sm text-navy-300">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderProfitLossReport = () => {
    if (!reportData) return null
    
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(reportData.totalRevenue || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Purchases</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {formatCurrency(reportData.totalPurchases || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {formatCurrency(reportData.totalExpenses || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Net Profit</p>
            <p className={`text-2xl font-bold mt-1 ${(reportData.netProfit || 0) >= 0 ? 'text-gold-400' : 'text-red-400'}`}>
              {formatCurrency(reportData.netProfit || 0)}
            </p>
          </div>
        </div>

        {/* Chart */}
        {reportData.chartData && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue vs Expenses</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#a4b8fc" fontSize={12} />
                  <YAxis stroke="#a4b8fc" fontSize={12} tickFormatter={(value) => `₹${value / 1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSalesReport = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Sales</p>
            <p className="text-2xl font-bold text-gold-400 mt-1">
              {formatCurrency(reportData.totalSales || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Invoices Count</p>
            <p className="text-2xl font-bold text-white mt-1">{reportData.invoiceCount || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Average Sale</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {formatCurrency(reportData.averageSale || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Pending Amount</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {formatCurrency(reportData.pendingAmount || 0)}
            </p>
          </div>
        </div>

        {reportData.salesByDay && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Sales Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#a4b8fc" fontSize={12} />
                  <YAxis stroke="#a4b8fc" fontSize={12} tickFormatter={(value) => `₹${value / 1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="amount" name="Sales" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {reportData.topProducts && reportData.topProducts.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
            <div className="space-y-3">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-navy-950 font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-white">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 font-semibold">{formatCurrency(product.total)}</p>
                    <p className="text-xs text-navy-400">{product.quantity} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderExpenseReport = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {formatCurrency(reportData.totalExpenses || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Categories</p>
            <p className="text-2xl font-bold text-white mt-1">{reportData.categoryCount || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Average Expense</p>
            <p className="text-2xl font-bold text-gold-400 mt-1">
              {formatCurrency(reportData.averageExpense || 0)}
            </p>
          </div>
        </div>

        {reportData.byCategory && reportData.byCategory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Expenses by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={reportData.byCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {reportData.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {reportData.byCategory.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-navy-200">{item.name}</span>
                      <span className="text-white">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.value / reportData.totalExpenses) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderInventoryReport = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Products</p>
            <p className="text-2xl font-bold text-white mt-1">{reportData.totalProducts || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Stock Value</p>
            <p className="text-2xl font-bold text-gold-400 mt-1">
              {formatCurrency(reportData.totalValue || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Weight</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {(reportData.totalWeight || 0).toFixed(2)}g
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{reportData.lowStock || 0}</p>
          </div>
        </div>

        {reportData.byCategory && reportData.byCategory.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Stock by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.byCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#a4b8fc" fontSize={12} tickFormatter={(value) => `₹${value / 1000}K`} />
                  <YAxis type="category" dataKey="name" stroke="#a4b8fc" fontSize={12} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Value" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCustomerReport = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Customers</p>
            <p className="text-2xl font-bold text-white mt-1">{reportData.totalCustomers || 0}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Total Revenue</p>
            <p className="text-2xl font-bold text-gold-400 mt-1">
              {formatCurrency(reportData.totalRevenue || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">Outstanding</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {formatCurrency(reportData.totalOutstanding || 0)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-navy-300">New This Month</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{reportData.newThisMonth || 0}</p>
          </div>
        </div>

        {reportData.topCustomers && reportData.topCustomers.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
            <div className="space-y-3">
              {reportData.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-navy-950 font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">{customer.name}</p>
                      <p className="text-xs text-navy-400">{customer.invoiceCount} invoices</p>
                    </div>
                  </div>
                  <p className="text-gold-400 font-semibold">{formatCurrency(customer.total)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderReport = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }

    switch (activeReport) {
      case 'profit-loss':
        return renderProfitLossReport()
      case 'sales':
        return renderSalesReport()
      case 'expenses':
        return renderExpenseReport()
      case 'inventory':
        return renderInventoryReport()
      case 'customers':
        return renderCustomerReport()
      case 'purchases':
        return renderSalesReport() // Similar structure
      default:
        return <p className="text-navy-300">Select a report to view</p>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Reports</h1>
          <p className="text-navy-300 mt-1">Business analytics and insights</p>
        </div>
        <button className="btn-secondary inline-flex items-center gap-2 self-start">
          <Download className="w-5 h-5" />
          Export PDF
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeReport === report.id
                ? 'bg-gold-500 text-navy-950'
                : 'bg-white/5 text-navy-200 hover:bg-white/10'
            }`}
          >
            <report.icon className="w-4 h-4" />
            {report.name}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      {!['inventory', 'customers'].includes(activeReport) && (
        <div className="flex flex-wrap items-center gap-3">
          <Calendar className="w-5 h-5 text-navy-400" />
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="input-field w-auto"
          />
          <span className="text-navy-400">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="input-field w-auto"
          />
        </div>
      )}

      {/* Report Content */}
      {renderReport()}
    </div>
  )
}


