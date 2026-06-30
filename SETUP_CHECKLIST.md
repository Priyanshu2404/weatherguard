# WeatherGuard Deployment Checklist

Complete this checklist to deploy WeatherGuard on Render successfully.

## Phase 1: Prerequisites & Planning

- [ ] You have a GitHub account with the weatherguard repository
- [ ] You have a Render account (free tier is fine)
- [ ] You have internet access and email access
- [ ] You've read the main [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- [ ] You understand the multi-service architecture (API + Frontend + Database)

## Phase 2: Set Up External Services

### MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a new project named "WeatherGuard"
- [ ] Create an M0 Free cluster
- [ ] Create database user: `weatherguard_user`
- [ ] Save database user password securely
- [ ] Add IP whitelist: `0.0.0.0/0` (or Render IP range)
- [ ] Get connection string with database name: `mongodb+srv://weatherguard_user:PASSWORD@cluster.mongodb.net/weatherguard?retryWrites=true&w=majority`
- [ ] Save connection string securely
- [ ] **Reference**: [SETUP_MONGODB_ATLAS.md](./SETUP_MONGODB_ATLAS.md)

### Google OAuth Setup
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth consent screen (External)
- [ ] Add test user (your email)
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add authorized JavaScript origins:
  - [ ] `http://localhost:3000` (local)
  - [ ] `https://weatherguard-api.onrender.com` (production)
- [ ] Add authorized redirect URIs:
  - [ ] `http://localhost:3000/api/auth/google/callback` (local)
  - [ ] `https://weatherguard-api.onrender.com/api/auth/google/callback` (production)
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Save both securely
- [ ] **Reference**: [SETUP_GOOGLE_OAUTH.md](./SETUP_GOOGLE_OAUTH.md)

### GitHub OAuth Setup
- [ ] Go to GitHub Settings → Developer settings → OAuth Apps
- [ ] Create new OAuth App
- [ ] Set Application name: `WeatherGuard`
- [ ] Set Homepage URL: `https://weatherguard-admin.onrender.com`
- [ ] Set Authorization callback URL: `https://weatherguard-api.onrender.com/api/auth/github/callback`
- [ ] Copy Client ID
- [ ] Generate and copy Client Secret
- [ ] Save both securely
- [ ] **Reference**: [SETUP_GITHUB_OAUTH.md](./SETUP_GITHUB_OAUTH.md)

### Telegram Bot Setup
- [ ] Open Telegram and search for @BotFather
- [ ] Send `/newbot` command
- [ ] Name your bot: `WeatherGuard Bot`
- [ ] Set bot username: `weatherguard_bot` (or similar)
- [ ] Copy bot token from BotFather
- [ ] Save token securely
- [ ] (Optional) Set bot commands via BotFather
- [ ] (Optional) Set bot description via BotFather
- [ ] **Reference**: [SETUP_TELEGRAM_WEATHER_API.md](./SETUP_TELEGRAM_WEATHER_API.md)

### OpenWeatherMap API Setup
- [ ] Create OpenWeatherMap account
- [ ] Verify email
- [ ] Log in to OpenWeatherMap
- [ ] Go to "My API Keys"
- [ ] Copy your Default API Key
- [ ] Save API key securely
- [ ] (Optional) Create additional key for production
- [ ] **Reference**: [SETUP_TELEGRAM_WEATHER_API.md](./SETUP_TELEGRAM_WEATHER_API.md)

## Phase 3: Prepare Repository

- [ ] Clone the weatherguard repository locally
- [ ] Verify `render.yaml` exists in root directory
- [ ] Verify `RENDER_DEPLOYMENT.md` exists
- [ ] Verify admin `src/api/client.ts` is updated for cross-domain requests
- [ ] All setup guides are in the repository
- [ ] Commit and push all changes to GitHub

## Phase 4: Deploy on Render

### Create Render Services
- [ ] Go to [Render Dashboard](https://dashboard.render.com)
- [ ] Click "New +" → "Blueprint"
- [ ] Connect your GitHub account
- [ ] Select `weatherguard` repository
- [ ] Confirm branch: `main`
- [ ] Review services:
  - [ ] `weatherguard-api` (Node.js web service)
  - [ ] `weatherguard-admin` (Static site)
- [ ] Click "Create Blueprint"
- [ ] Wait for initial deployment to start

### Set Environment Variables (API Service)
- [ ] Go to `weatherguard-api` service
- [ ] Click "Environment"
- [ ] Add/Update variables:
  - [ ] `MONGODB_URI`: Your MongoDB connection string
  - [ ] `GOOGLE_CLIENT_ID`: From Google Cloud Console
  - [ ] `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
  - [ ] `GITHUB_CLIENT_ID`: From GitHub OAuth App
  - [ ] `GITHUB_CLIENT_SECRET`: From GitHub OAuth App
  - [ ] `ADMIN_EMAIL`: Your admin email address
  - [ ] `TELEGRAM_BOT_TOKEN`: From @BotFather
  - [ ] `OPENWEATHER_API_KEY`: From OpenWeatherMap
- [ ] Click "Save Changes"
- [ ] Wait for API to redeploy

### Set Environment Variables (Admin Service)
- [ ] Go to `weatherguard-admin` service
- [ ] Click "Environment"
- [ ] Verify `VITE_API_URL` is set to: `https://weatherguard-api.onrender.com`
- [ ] Click "Save Changes"
- [ ] Wait for admin to redeploy

### Update OAuth Redirect URIs
- [ ] Go to Google Cloud Console
- [ ] Update OAuth Client authorized redirect URIs with your final Render domain
- [ ] Go to GitHub OAuth App settings
- [ ] Update Authorization callback URL with your final Render domain

## Phase 5: Verification & Testing

### Test API Service
- [ ] Check API logs: `API server listening on port 10000`
- [ ] No errors in logs
- [ ] API responds to health check: `curl https://weatherguard-api.onrender.com/`

### Test Admin Frontend
- [ ] Visit `https://weatherguard-admin.onrender.com`
- [ ] Login page loads
- [ ] "Continue with Google" button works
- [ ] "Continue with GitHub" button works

### Test Google OAuth
- [ ] Click "Continue with Google"
- [ ] Redirected to Google login
- [ ] Can sign in with your test account
- [ ] Redirected back to WeatherGuard
- [ ] Dashboard or pending approval screen shows

### Test GitHub OAuth
- [ ] Click "Continue with GitHub"
- [ ] Redirected to GitHub login
- [ ] Can authorize the application
- [ ] Redirected back to WeatherGuard
- [ ] Dashboard or pending approval screen shows

### Test MongoDB Connection
- [ ] Check API logs for connection success
- [ ] No "MongooseError" or "connection timeout" errors
- [ ] Go to MongoDB Atlas → Collections
- [ ] See `weatherguard` database created
- [ ] See `users` collection with your test user

### Test Telegram Bot
- [ ] Search for your bot on Telegram
- [ ] Click "Start"
- [ ] Bot responds
- [ ] Send `/link <token>` (get token from admin dashboard)
- [ ] Bot confirms linking
- [ ] Send `/setcity New York`
- [ ] Bot confirms city is set

### Test Weather Alerts
- [ ] Approve a user in admin dashboard
- [ ] User links Telegram account
- [ ] User sets city
- [ ] Trigger manual alert: `curl -X POST https://weatherguard-api.onrender.com/api/scheduler/trigger -H "Cookie: access_token=YOUR_JWT"`
- [ ] Telegram bot sends weather alert

## Phase 6: Post-Deployment

### Monitoring
- [ ] Set up log monitoring in Render Dashboard
- [ ] Check logs daily for first week
- [ ] Monitor MongoDB Atlas for connection issues
- [ ] Monitor OpenWeatherMap API usage

### Maintenance
- [ ] Set up automated MongoDB backups
- [ ] Document admin email for future reference
- [ ] Share deployment documentation with team
- [ ] Create runbook for common issues

### Optional Enhancements
- [ ] Add custom domain to Render services
- [ ] Set up SSL/TLS (Render provides free certificates)
- [ ] Configure email notifications for deployment failures
- [ ] Set up uptime monitoring
- [ ] Create admin user account for team members

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| API won't start | Check logs, verify all env vars are set |
| MongoDB connection fails | Verify connection string, check IP whitelist |
| OAuth login fails | Verify callback URLs match exactly |
| Telegram bot doesn't respond | Check token in env vars, verify API is running |
| Weather alerts not sent | Verify user linked Telegram and set city |
| Admin frontend blank | Check browser console, verify VITE_API_URL |
| CORS errors | Verify FRONTEND_URL matches admin domain |

## Important Credentials to Save

Create a secure document with these credentials:

```
WeatherGuard Deployment Credentials
====================================

MongoDB Atlas:
- Connection String: mongodb+srv://...
- Username: weatherguard_user
- Password: [saved securely]

Google OAuth:
- Client ID: [saved securely]
- Client Secret: [saved securely]

GitHub OAuth:
- Client ID: [saved securely]
- Client Secret: [saved securely]

Telegram Bot:
- Bot Token: [saved securely]
- Bot Username: @weatherguard_bot

OpenWeatherMap:
- API Key: [saved securely]

Render:
- API Domain: https://weatherguard-api.onrender.com
- Admin Domain: https://weatherguard-admin.onrender.com
- Admin Email: [your email]
```

## Timeline Estimate

- **Phase 1**: 5 minutes
- **Phase 2**: 30-45 minutes (creating accounts and getting credentials)
- **Phase 3**: 5 minutes
- **Phase 4**: 15-20 minutes (deployment and configuration)
- **Phase 5**: 15-20 minutes (testing all features)
- **Phase 6**: 10 minutes (post-deployment setup)

**Total**: ~90 minutes for complete deployment

## Support Resources

- [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) - Main deployment guide
- [SETUP_MONGODB_ATLAS.md](./SETUP_MONGODB_ATLAS.md) - MongoDB setup
- [SETUP_GOOGLE_OAUTH.md](./SETUP_GOOGLE_OAUTH.md) - Google OAuth setup
- [SETUP_GITHUB_OAUTH.md](./SETUP_GITHUB_OAUTH.md) - GitHub OAuth setup
- [SETUP_TELEGRAM_WEATHER_API.md](./SETUP_TELEGRAM_WEATHER_API.md) - Telegram & Weather API setup
- [README.md](./README.md) - Project overview

## Next Steps After Deployment

1. **Invite team members**: Add other admins to approve users
2. **Customize bot messages**: Modify Telegram bot responses
3. **Add more weather data**: Extend weather alerts with more details
4. **Set up alerts schedule**: Customize when alerts are sent
5. **Add analytics**: Track user engagement and alert delivery
6. **Scale up**: Upgrade to paid Render plan if needed

---

**Status**: Ready to Deploy ✅
**Last Updated**: June 30, 2026
**Estimated Deployment Time**: ~90 minutes
