# GSC Fresh Analytics - Railway Deployment Guide

## Prerequisites
1. Railway account (https://railway.app)
2. Google OAuth credentials configured with production URLs
3. GitHub repository (optional but recommended)

## Deployment Steps

### 1. Prepare Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Update your OAuth Client ID:
   - **Authorized JavaScript origins**: Add your Railway backend URL (e.g., `https://your-app.up.railway.app`)
   - **Authorized redirect URIs**: Add `https://your-backend-url.up.railway.app/auth/callback`
3. Keep your `client_secret.json` file ready

### 2. Deploy Backend on Railway

#### Option A: Deploy from GitHub
1. Push this code to GitHub
2. Go to Railway Dashboard → New Project → Deploy from GitHub repo
3. Select your repository

#### Option B: Deploy via Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Configure Environment Variables in Railway

In your Railway project dashboard, add these environment variables:

```
BACKEND_URL=https://your-backend-url.up.railway.app
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

### 4. Upload client_secret.json

You have two options:

**Option A: Add to repository (not recommended for security)**
- Add `client_secret.json` to `/backend/` directory
- **Important**: Make sure it's in `.gitignore` if using this approach

**Option B: Use Railway volumes (recommended)**
1. In Railway dashboard, go to your service
2. Add a volume mounted to `/app/backend`
3. Upload `client_secret.json` via Railway CLI or dashboard

### 5. Deploy Frontend

The frontend needs to be built and served separately. Options:

#### Option 1: Build frontend and serve with backend
```python
# In backend/main.py, add static file serving:
from fastapi.staticfiles import StaticFiles

# After building frontend: npm run build
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
```

#### Option 2: Deploy frontend separately (recommended)
- Use Vercel, Netlify, or Railway for frontend
- Update `FRONTEND_URL` and `BACKEND_URL` accordingly

### 6. Build Frontend for Production

```bash
cd frontend
npm run build
```

### 7. Update Frontend API URLs

Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.up.railway.app
```

Then update frontend code to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### 8. Test the Deployment

1. Visit your Railway app URL
2. Click "Connect with Google"
3. Verify OAuth flow works
4. Test data fetching

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_URL` | Your Railway backend URL | `https://your-app.up.railway.app` |
| `FRONTEND_URL` | Your frontend URL | `https://your-frontend.vercel.app` |

## Troubleshooting

### OAuth Redirect Mismatch
- Ensure `BACKEND_URL/auth/callback` is in Google OAuth redirect URIs
- Check that `BACKEND_URL` environment variable is set correctly

### CORS Errors
- Verify `FRONTEND_URL` environment variable matches your actual frontend URL
- Check Railway logs for CORS-related errors

### client_secret.json Not Found
- Verify the file is uploaded to Railway
- Check file path in Railway volume or repository

## Notes

- Railway automatically assigns a domain: `https://your-service.up.railway.app`
- You can add a custom domain in Railway settings
- Free tier has limitations - consider upgrading for production use
- Make sure to enable Google Search Console API in your Google Cloud project
