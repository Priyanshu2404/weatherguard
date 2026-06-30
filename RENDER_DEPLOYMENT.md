# WeatherGuard Deployment Guide for Render

This guide provides step-by-step instructions to deploy the WeatherGuard application on Render, including the NestJS API, React admin frontend, and MongoDB database.

## Overview

WeatherGuard is a multi-service application consisting of:

- **API**: NestJS backend with OAuth authentication, Telegram bot integration, and weather scheduling
- **Admin**: React + Vite frontend with Tailwind CSS
- **Database**: MongoDB for user and configuration storage

## Architecture on Render

```
┌─────────────────────────────────────────────────────┐
│                    Render Platform                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐        ┌──────────────────┐  │
│  │  Admin Frontend  │        │   API Backend    │  │
│  │  (Static Site)   │◄──────►│  (Web Service)   │  │
│  │   React + Vite   │        │    NestJS        │  │
│  └──────────────────┘        └──────────────────┘  │
│                                      │              │
│                                      ▼              │
│                              ┌──────────────────┐  │
│                              │   MongoDB Atlas  │  │
│                              │    (Database)    │  │
│                              └──────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account**: Repository must be hosted on GitHub
2. **Render Account**: Create a free account at [render.com](https://render.com)
3. **MongoDB Atlas Account**: Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
4. **OAuth Credentials**:
   - Google OAuth 2.0 Client ID and Secret
   - GitHub OAuth App Client ID and Secret
5. **External API Keys**:
   - Telegram Bot Token (from @BotFather)
   - OpenWeatherMap API Key (free tier available)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new account or sign in
3. Create a new project named "WeatherGuard"
4. Click "Build a Database" and choose the **M0 Free Tier**
5. Select your preferred region (same as Render region recommended)
6. Create a database user:
   - Username: `weatherguard_user`
   - Password: Generate a strong password and save it
7. Add IP whitelist: Click "Allow Access from Anywhere" (0.0.0.0/0) for development
8. Click "Finish and Close"

### 1.2 Get Your Connection String

1. In the Atlas dashboard, click "Connect"
2. Select "Drivers"
3. Copy the connection string (it will look like: `mongodb+srv://weatherguard_user:<password>@cluster0.xxxxx.mongodb.net/weatherguard?retryWrites=true&w=majority`)
4. Replace `<password>` with your actual password
5. Save this as your `MONGODB_URI` environment variable

## Step 2: Prepare Your Repository

### 2.1 Update OAuth Callback URLs

The OAuth callback URLs need to point to your Render API domain. You'll set this up after deploying the API, but for now, note the pattern:

- **Google Callback**: `https://your-api-name.onrender.com/api/auth/google/callback`
- **GitHub Callback**: `https://your-api-name.onrender.com/api/auth/github/callback`

### 2.2 Create render.yaml

Create a `render.yaml` file in the root of your repository with the following content:

```yaml
services:
  # MongoDB is managed externally via MongoDB Atlas, not defined here

  # NestJS API Backend
  - type: web
    name: weatherguard-api
    runtime: node
    plan: free
    repo: https://github.com/YOUR_USERNAME/weatherguard.git
    branch: main
    rootDir: api
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: PORT
        value: "10000"
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false  # Set this in Render Dashboard
      - key: FRONTEND_URL
        value: https://weatherguard-admin.onrender.com
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: GOOGLE_CALLBACK_URL
        value: https://weatherguard-api.onrender.com/api/auth/google/callback
      - key: GITHUB_CLIENT_ID
        sync: false
      - key: GITHUB_CLIENT_SECRET
        sync: false
      - key: GITHUB_CALLBACK_URL
        value: https://weatherguard-api.onrender.com/api/auth/github/callback
      - key: ADMIN_EMAIL
        sync: false
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: OPENWEATHER_API_KEY
        sync: false

  # React Admin Frontend
  - type: web
    name: weatherguard-admin
    runtime: static
    plan: free
    repo: https://github.com/YOUR_USERNAME/weatherguard.git
    branch: main
    rootDir: admin
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://weatherguard-api.onrender.com
```

### 2.3 Update Admin API Configuration

Update `/admin/src/pages/LoginPage.tsx` to use the environment variable:

```typescript
const apiBase = import.meta.env.VITE_API_URL || '';
```

This is already in place, so no changes needed.

### 2.4 Update Admin Axios Client

The admin's Axios client uses `/api` as a relative path. Since the frontend and API will be on different Render domains, update `/admin/src/api/client.ts`:

```typescript
import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : '/api',
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
```

### 2.5 Update API CORS Configuration

The API already reads `FRONTEND_URL` from environment variables, which is correct. No changes needed.

### 2.6 Commit and Push Changes

```bash
git add render.yaml RENDER_DEPLOYMENT.md admin/src/api/client.ts
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 3: Deploy on Render

### 3.1 Connect Your Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Blueprint"
3. Connect your GitHub account if not already connected
4. Select the `weatherguard` repository
5. Confirm the branch (main)

### 3.2 Review and Deploy

1. Render will detect your `render.yaml` file
2. Review the services and environment variables
3. Click "Create Blueprint"
4. Render will start deploying both services

### 3.3 Set Environment Variables

After the initial deploy attempt, you'll need to set sensitive environment variables:

1. Go to the **weatherguard-api** service
2. Click "Environment"
3. Add the following variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `GITHUB_CLIENT_ID`: From GitHub OAuth App settings
   - `GITHUB_CLIENT_SECRET`: From GitHub OAuth App settings
   - `ADMIN_EMAIL`: Your admin email address
   - `TELEGRAM_BOT_TOKEN`: From @BotFather
   - `OPENWEATHER_API_KEY`: From OpenWeatherMap

4. Click "Save Changes"
5. The service will redeploy with the new variables

### 3.4 Update OAuth Redirect URIs

Now that your API is deployed, update your OAuth app configurations:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs":
   - `https://weatherguard-api.onrender.com/api/auth/google/callback`

**GitHub OAuth:**
1. Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Click on your app
3. Update "Authorization callback URL":
   - `https://weatherguard-api.onrender.com/api/auth/github/callback`

## Step 4: Verify Deployment

### 4.1 Test the API

```bash
curl https://weatherguard-api.onrender.com/
```

You should see a response confirming the API is running.

### 4.2 Test the Admin Dashboard

1. Visit `https://weatherguard-admin.onrender.com`
2. You should see the login page
3. Click "Continue with Google" or "Continue with GitHub"
4. You should be redirected to the OAuth provider
5. After authentication, you should see the dashboard (if you're the admin) or a pending approval screen

### 4.3 Test MongoDB Connection

The API should automatically connect to MongoDB on startup. Check the logs:

1. Go to the **weatherguard-api** service
2. Click "Logs"
3. Look for: `API server listening on port 10000`

### 4.4 Test Telegram Bot

1. Find your Telegram bot (search for its username)
2. Send `/link <token>` (you'll get the token from the admin dashboard)
3. The bot should confirm the link
4. Send `/setcity <city_name>` to set your weather alert city

## Troubleshooting

### Issue: "Cannot find module" errors during build

**Solution**: Ensure all dependencies are in `package.json` and run `npm install` locally to verify.

### Issue: OAuth callback fails with "Invalid redirect URI"

**Solution**: 
- Verify the callback URL matches exactly in both Render environment variables and OAuth provider settings
- Ensure `FRONTEND_URL` is set correctly in the API environment variables

### Issue: MongoDB connection timeout

**Solution**:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0` or add Render's IP range
- Ensure the connection string includes the correct username and password

### Issue: CORS errors in browser console

**Solution**:
- Verify `FRONTEND_URL` environment variable matches your admin domain exactly
- Ensure the API has `credentials: true` in CORS configuration (already set)

### Issue: Admin frontend shows blank page

**Solution**:
- Check browser console for errors
- Verify `VITE_API_URL` environment variable is set correctly
- Ensure the admin build completed successfully (check logs)

## Environment Variables Reference

| Variable | Service | Required | Example |
|----------|---------|----------|---------|
| `MONGODB_URI` | API | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/weatherguard` |
| `FRONTEND_URL` | API | Yes | `https://weatherguard-admin.onrender.com` |
| `JWT_SECRET` | API | Yes | Auto-generated by Render |
| `GOOGLE_CLIENT_ID` | API | Yes | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | API | Yes | From Google Cloud Console |
| `GITHUB_CLIENT_ID` | API | Yes | From GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | API | Yes | From GitHub OAuth App |
| `ADMIN_EMAIL` | API | Yes | `admin@example.com` |
| `TELEGRAM_BOT_TOKEN` | API | Yes | From @BotFather |
| `OPENWEATHER_API_KEY` | API | Yes | From OpenWeatherMap |
| `VITE_API_URL` | Admin | Yes | `https://weatherguard-api.onrender.com` |

## Monitoring and Maintenance

### View Logs

1. Go to your service in the Render Dashboard
2. Click "Logs" to view real-time logs
3. Use filters to search for specific events

### Scale Your Services

1. Go to the service settings
2. Adjust the instance count or plan
3. Render will handle rolling updates

### Update Your Application

1. Push changes to your GitHub repository
2. Render will automatically redeploy on push (if auto-deploy is enabled)
3. Monitor the deployment progress in the Dashboard

## Next Steps

1. **Set up automated weather alerts**: Configure the scheduler to run at specific times
2. **Add custom domain**: Connect your own domain in Render settings
3. **Enable SSL/TLS**: Render provides free SSL certificates
4. **Set up monitoring**: Use Render's built-in monitoring or integrate with external services
5. **Backup strategy**: Set up MongoDB Atlas automated backups

## Support

For issues or questions:
- Check [Render Documentation](https://render.com/docs)
- Review [WeatherGuard README](./README.md)
- Check service logs in Render Dashboard
- Consult [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

**Last Updated**: June 30, 2026
**WeatherGuard Version**: 1.0.0
