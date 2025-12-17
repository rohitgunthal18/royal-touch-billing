# 🚀 Royal Touch Jewellery - Deployment Guide

This guide will help you deploy the Royal Touch Jewellery billing software with:
- **Frontend** on Vercel (Free)
- **Backend** on Render (Free)

---

## Prerequisites

1. GitHub account (already connected)
2. Vercel account (sign up at https://vercel.com)
3. Render account (sign up at https://render.com)

---

## Step 1: Push Code to GitHub

First, push your code to GitHub:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Royal Touch Jewellery Billing"

# Add remote repository
git remote add origin https://github.com/rohitgunthal18/royal-touch-billing.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for easy deployment)

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `rohitgunthal18/royal-touch-billing`
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `royal-touch-api` |
| **Region** | Oregon (US West) or nearest to you |
| **Branch** | `main` |
| **Root Directory** | Leave empty |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 2.3 Add Environment Variables
Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

### 2.4 Add Persistent Disk (Important for Database!)
1. Scroll down to **"Disk"** section
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (takes 5-10 minutes)
3. **Copy your backend URL**: `https://royal-touch-api.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import from GitHub: `rohitgunthal18/royal-touch-billing`

### 3.3 Configure Project
| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3.4 Add Environment Variable (IMPORTANT!)
In **"Environment Variables"** section, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://royal-touch-api.onrender.com/api` |

⚠️ **Replace `royal-touch-api` with your actual Render service name!**

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait for deployment (takes 2-3 minutes)
3. Your site will be live at: `https://royal-touch-billing.vercel.app`

---

## Step 4: Update Backend CORS (Optional but Recommended)

After getting your Vercel URL, update Render environment variables:

1. Go to Render Dashboard → Your Service → Environment
2. Add new variable:
   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | `https://royal-touch-billing.vercel.app` |
3. Click **"Save Changes"** (service will redeploy)

---

## 🎉 You're Done!

Your application is now live:
- **Frontend**: `https://royal-touch-billing.vercel.app`
- **Backend API**: `https://royal-touch-api.onrender.com`

---

## Troubleshooting

### Frontend shows "Failed to load data"
- Check if backend is running on Render
- Verify `VITE_API_URL` is correct in Vercel
- Check browser console for errors

### Backend is slow to respond
- Free Render services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan for always-on

### Database not saving data
- Make sure you added the persistent disk on Render
- Check the mount path is correct: `/opt/render/project/src/data`

### Images not uploading
- Check uploads folder permissions on Render
- Consider using a cloud storage service for production (like Cloudinary)

---

## Custom Domain (Optional)

### For Vercel Frontend:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Render Backend:
1. Go to Service Settings → Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- GitHub Issues: Create an issue in your repository

