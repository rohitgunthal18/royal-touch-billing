import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  Menu,
  X,
  Gem,
  ChevronDown,
  Bell,
  Search,
  Plus
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sales & Invoices', href: '/sales', icon: ShoppingCart },
  { name: 'Purchases', href: '/purchases', icon: Receipt },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Suppliers', href: '/suppliers', icon: Truck },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-navy-950/80 backdrop-blur-2xl border-r border-white/10">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center shadow-gold">
                <Gem className="w-7 h-7 text-navy-950" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold gold-text">Royal Touch</h1>
                <p className="text-xs text-navy-300">Jewellery Billing</p>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="p-4">
            <NavLink
              to="/sales/new"
              className="flex items-center justify-center gap-2 w-full btn-primary"
            >
              <Plus className="w-5 h-5" />
              <span>New Invoice</span>
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive || (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'active'
                      : ''
                  }`
                }
                end={item.href === '/'}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                  <span className="text-navy-950 font-bold">RT</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Royal Touch</p>
                  <p className="text-xs text-navy-300 truncate">admin@royaltouch.com</p>
                </div>
                <ChevronDown className="w-4 h-4 text-navy-400" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-navy-950/60 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search invoices, customers, products..."
                  className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-400/20 transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-navy-200" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gold-400 rounded-full border-2 border-navy-950" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-navy-200">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


