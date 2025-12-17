# 💎 JewelBill Pro - Premium Jewelry Billing Software

A modern, feature-rich web-based billing software designed specifically for jewelry shops. Built with React, Node.js, and SQLite, featuring a stunning premium UI inspired by Vyapar.

![JewelBill Pro](https://img.shields.io/badge/JewelBill-Pro-gold?style=for-the-badge&logo=gem&logoColor=white)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=nodedotjs)
![SQLite](https://img.shields.io/badge/SQLite-3-blue?style=flat-square&logo=sqlite)

## ✨ Features

### 📊 Dashboard
- Real-time business overview
- Sales analytics with beautiful charts
- Today's collection & gold rate display
- Low stock alerts
- Recent sales summary

### 🧾 Billing & Invoicing
- Professional GST-compliant invoices
- Multiple payment modes (Cash, Card, UPI, Bank Transfer)
- Auto-calculation of GST (CGST/SGST)
- Customizable invoice templates
- Print & export functionality
- Walk-in customer support

### 📦 Inventory Management
- Track jewelry items with weight, purity, and category
- Real-time stock tracking
- Low stock alerts
- SKU & HSN code support
- Multiple metal types (Gold, Silver, Platinum, Diamond)
- Purity options (24K, 22K, 18K, 14K, Sterling Silver)

### 👥 Customer Management (CRM)
- Complete customer profiles
- Purchase history tracking
- Outstanding balance management
- GST & PAN number storage
- Customer-wise reports

### 🚚 Supplier Management
- Supplier database
- Purchase order tracking
- Outstanding payment tracking
- Supplier-wise reports

### 💰 Expense Tracking
- Categorized expense recording
- Payment method tracking
- Expense analytics & charts
- Monthly expense breakdown

### 📈 Reports & Analytics
- Profit & Loss statements
- Sales reports with trends
- Purchase reports
- Expense analysis
- Inventory valuation
- Customer reports
- Export to PDF

### ⚙️ Settings
- Business profile customization
- Invoice settings
- Tax rate configuration
- Gold/Silver rate updates
- Data backup & restore

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   cd "Billing Software"
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```
   This installs both server and client dependencies.

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── database.js        # SQLite database setup
│   └── index.js           # Express server
├── data/                   # SQLite database files
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Charts & graphs
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **better-sqlite3** - SQLite database
- **CORS** - Cross-origin support

### Database
- **SQLite** - Lightweight, file-based database
- Easy migration to PostgreSQL/MySQL later

## 📱 Responsive Design

JewelBill Pro is fully responsive and works seamlessly on:
- 🖥️ Desktop computers
- 💻 Laptops
- 📱 Tablets
- 📱 Mobile phones

## 🎨 UI Design

The premium UI features:
- Dark navy theme with gold accents
- Glassmorphism effects
- Smooth animations
- Intuitive navigation
- Modern typography (Playfair Display & DM Sans)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
```

### Database

The SQLite database is automatically created in the `data/` folder on first run. Sample data is inserted for demo purposes.

## 📝 API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Business statistics
- `GET /api/dashboard/recent-sales` - Recent sales
- `GET /api/dashboard/sales-chart` - Chart data

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice with items
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Reports
- `GET /api/reports/profit-loss` - P&L report
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/expenses` - Expense report
- `GET /api/reports/inventory` - Inventory report

## 🔮 Future Enhancements

- [ ] Multi-branch support
- [ ] Barcode scanning
- [ ] WhatsApp integration
- [ ] E-invoice (GST portal integration)
- [ ] Cloud backup
- [ ] Multi-user with roles
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ for Jewelry Businesses
</p>


