import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Package,
  Users,
  ShoppingCart,
  ArrowRight,
  Clock,
  Gem,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { formatCurrency, formatDate, statusColors } from '../utils/format'
import { getDashboardStats, getRecentSales, getSalesChart } from '../utils/api'

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <p className="text-sm text-navy-300">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {changeType === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-navy-950" />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingPayments: 0,
    salesChange: 0,
    customersChange: 0
  })
  const [recentSales, setRecentSales] = useState([])
  const [chartData, setChartData] = useState([])
  const [chartPeriod, setChartPeriod] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    loadChartData()
  }, [chartPeriod])

  const loadDashboardData = async () => {
    try {
      const [statsData, salesData] = await Promise.all([
        getDashboardStats(),
        getRecentSales()
      ])
      setStats(statsData)
      setRecentSales(salesData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      const data = await getSalesChart(chartPeriod)
      setChartData(data)
    } catch (error) {
      console.error('Failed to load chart data:', error)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-gold-400/30">
          <p className="text-sm text-navy-300">{label}</p>
          <p className="text-lg font-semibold text-gold-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-navy-300 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <Link to="/sales/new" className="btn-primary inline-flex items-center gap-2 self-start">
          <ShoppingCart className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={formatCurrency(stats.totalSales)}
          change={stats.salesChange}
          changeType={stats.salesChange >= 0 ? 'up' : 'down'}
          icon={IndianRupee}
          color="gold-gradient"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change={stats.customersChange}
          changeType={stats.customersChange >= 0 ? 'up' : 'down'}
          icon={Users}
          color="bg-emerald-400"
        />
        <StatCard
          title="Products in Stock"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-400"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(stats.pendingPayments)}
          icon={Clock}
          color="bg-amber-400"
        />
      </div>

      {/* Charts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Sales Overview</h2>
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartPeriod === period
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-white/5 text-navy-200 hover:bg-white/10'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#a4b8fc" fontSize={12} />
                <YAxis stroke="#a4b8fc" fontSize={12} tickFormatter={(value) => `₹${value / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Sales</h2>
            <Link to="/sales" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <Gem className="w-12 h-12 text-navy-400 mx-auto mb-3" />
                <p className="text-navy-300">No recent sales</p>
                <Link to="/sales/new" className="text-gold-400 text-sm hover:underline mt-2 inline-block">
                  Create your first invoice
                </Link>
              </div>
            ) : (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                      <span className="text-navy-950 font-bold text-sm">
                        {sale.customer_name?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{sale.customer_name || 'Walk-in'}</p>
                      <p className="text-xs text-navy-400">{sale.invoice_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 font-semibold">{formatCurrency(sale.total_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[sale.payment_status]}`}>
                      {sale.payment_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Low Stock Alert</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats.lowStockCount || 0}</p>
          <p className="text-sm text-navy-300 mt-1">Products below minimum stock</p>
          <Link to="/inventory" className="text-gold-400 text-sm hover:underline mt-4 inline-block">
            View inventory →
          </Link>
        </div>

        {/* Today's Collection */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Today's Collection</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{formatCurrency(stats.todayCollection || 0)}</p>
          <p className="text-sm text-navy-300 mt-1">{stats.todayInvoices || 0} invoices generated</p>
        </div>

        {/* Gold Rate */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg gold-gradient">
              <Gem className="w-5 h-5 text-navy-950" />
            </div>
            <h3 className="text-lg font-semibold text-white">Gold Rate (22K)</h3>
          </div>
          <p className="text-3xl font-bold gold-text">{formatCurrency(stats.goldRate || 6850)}/g</p>
          <p className="text-sm text-navy-300 mt-1">
            <span className="text-emerald-400">+₹50</span> from yesterday
          </p>
        </div>
      </div>
    </div>
  )
}


