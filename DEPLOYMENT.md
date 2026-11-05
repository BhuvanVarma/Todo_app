# Deployment Guide: PERN Todo App

This guide outlines step-by-step instructions to deploy the full-stack PERN Todo application to production using **Neon** (PostgreSQL), **Render** (Express backend), and **Vercel** (React frontend).

---

## Deployment Architecture Overview

- **Database**: [Neon](https://neon.tech/) — Managed Serverless PostgreSQL with SSL.
- **Backend API**: [Render](https://render.com/) — Web Service running Node.js / Express.
- **Frontend App**: [Vercel](https://vercel.com/) — Fast edge CDN hosting the Vite React SPA.

---

## Deployment Steps (In Order)

### Step 1: Provision the PostgreSQL Database on Neon

1. Sign in to [Neon](https://console.neon.tech/).
2. Click **Create Project** (e.g., name it `pern-todo`).
3. Note your connection string displayed in the dashboard:
   ```text
   postgresql://<username>:<password>@<neon-hostname>/pern_todo?sslmode=require
   ```
4. Navigate to the **SQL Editor** tab in Neon, or connect via `psql` from your terminal:
   ```bash
   psql "postgresql://<username>:<password>@<neon-hostname>/neondb?sslmode=require" -f server/schema.sql
   ```
5. Confirm that the `users` and `todos` tables and indexes were created.

---

### Step 2: Deploy the Backend API on Render

1. Sign in to [Render](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`pern-todo`).
4. Configure the service settings:
   - **Name**: `pern-todo-api` (or your preferred name)
   - **Region**: Choose the region closest to your Neon database
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: Free or Starter
5. Add the **Environment Variables** in Render:
   | Key | Value / Description |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (Render defaults to 10000; or leave default) |
   | `DATABASE_URL` | Neon connection string with SSL parameter |
   | `JWT_SECRET` | A secure, random 32+ character secret string |
   | `CLIENT_ORIGIN` | Temporary placeholder (e.g. `http://localhost:5173`) until Step 3 |

6. Click **Create Web Service**. Wait for the initial deployment to complete.
7. Test the health endpoint:
   ```text
   https://<your-render-app>.onrender.com/health
   ```
   You should receive `{ "status": "ok" }`. Copy your Render backend URL.

---

### Step 3: Deploy the Frontend on Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`pern-todo`).
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
   - **Build and Output Settings**: Defaults (`npm run build`, output directory `dist`)
5. In **Environment Variables**, add:
   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | Your Render backend URL (e.g., `https://pern-todo-api.onrender.com`) |

6. Click **Deploy**.
7. Once deployed, Vercel provides your production URL (e.g. `https://pern-todo.vercel.app`).
8. Notice that `client/vercel.json` contains SPA rewrites ensuring route refreshes (e.g., `/todos`, `/login`) work without 404 errors.

---

### Step 4: Update Backend CORS with Frontend Production URL

1. Return to the [Render Dashboard](https://dashboard.render.com/) -> Your `pern-todo-api` service.
2. Go to **Environment** tab.
3. Update `CLIENT_ORIGIN` to match your Vercel frontend URL:
   ```text
   CLIENT_ORIGIN = https://pern-todo.vercel.app
   ```
   *(No trailing slash)*
4. Save changes. Render will automatically redeploy the backend with the new allowed origin.

---

### Step 5: Configure Render Auto-Deploy with CI Checks

To prevent deploying untested code to production:

1. In Render, open your Web Service and navigate to **Settings**.
2. Locate the **Auto-Deploy** section.
3. Switch from **Auto-Deploy: Yes** to **Auto-Deploy: After CI Checks Pass**.
4. Render will now verify that the GitHub Actions CI workflow (defined in `.github/workflows/ci.yml`) succeeds on `main` before triggering any production deployment.

---

## Verifying Production End-to-End

1. Visit your Vercel URL (`https://your-app.vercel.app`).
2. Register a new user account.
3. Verify that:
   - Registration creates the user in Neon.
   - The auth cookie is set with `Secure; SameSite=None` attributes.
   - You are redirected to `/todos`.
   - Creating, toggling, editing, and deleting todos works.
   - Logging out clears the session.

