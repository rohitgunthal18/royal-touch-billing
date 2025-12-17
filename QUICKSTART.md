# 🚀 Quick Start Guide

## Step 1: Install Dependencies

First time setup - run this once:

```bash
npm run setup
```

This installs both server and client dependencies.

## Step 2: Start the Application

Run both frontend and backend together:

```bash
npm run dev
```

This will start:
- **Frontend (React)**: http://localhost:5173
- **Backend (API)**: http://localhost:3001

## Step 3: Access the Application

**Important**: Open your browser and go to:

```
http://localhost:5173
```

**NOT** localhost:3001 (that's just the API server)

### What you'll see:
- **localhost:5173** → Full application dashboard (this is what you want!)
- **localhost:3001** → API server info page (for development reference)

## Troubleshooting

### Issue: "Cannot GET /" on localhost:3001
✅ **Fixed!** The server now shows a helpful page. But remember:
- Use **localhost:5173** for the application
- localhost:3001 is just the API backend

### Issue: Port already in use
If port 5173 or 3001 is busy:
1. Close other applications using those ports
2. Or edit `vite.config.js` to change frontend port
3. Or edit `server/index.js` to change backend port

### Issue: Database errors
The SQLite database is created automatically in the `data/` folder on first run.
Make sure the `data/` folder exists and is writable.

## Development Commands

```bash
# Install dependencies (first time only)
npm run setup

# Start both frontend and backend
npm run dev

# Start only backend
npm run dev:server

# Start only frontend (in client folder)
cd client && npm run dev

# Build for production
npm run build
```

## Need Help?

- Check `README.md` for full documentation
- Database file: `data/jewelbill.db`
- Server logs show in terminal

