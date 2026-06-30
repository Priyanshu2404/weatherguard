# GitHub OAuth Setup Guide for WeatherGuard

This guide walks you through setting up GitHub OAuth authentication for the WeatherGuard application.

## What is GitHub OAuth?

GitHub OAuth allows users to sign in using their GitHub account. It's a quick alternative to Google OAuth and is popular among developers.

## Prerequisites

- GitHub account
- Access to GitHub Settings
- Your Render API domain (e.g., `https://weatherguard-api.onrender.com`)

## Step 1: Register OAuth Application on GitHub

### 1.1 Go to GitHub Developer Settings

1. Log in to your GitHub account
2. Click your profile icon (top right) → **"Settings"**
3. In the left sidebar, scroll down and click **"Developer settings"**
4. Click **"OAuth Apps"** (or **"OAuth applications"**)

### 1.2 Create New OAuth App

1. Click **"New OAuth App"** button
2. Fill in the application details:

   **Application name**:
   - `WeatherGuard` or `WeatherGuard Admin`

   **Homepage URL**:
   - For development: `http://localhost:5173`
   - For production: `https://weatherguard-admin.onrender.com`

   **Application description** (optional):
   - `Weather alert service with admin dashboard`

   **Authorization callback URL**:
   - For development: `http://localhost:3000/api/auth/github/callback`
   - For production: `https://weatherguard-api.onrender.com/api/auth/github/callback`
   - ⚠️ **Important**: This must be exact - no trailing slashes

3. Click **"Register application"**

### 1.3 Get Your Credentials

1. You'll see your OAuth app details page
2. Copy these values:
   - **Client ID**: (shown at the top)
   - **Client Secret**: Click **"Generate a new client secret"** and copy it
3. **Important**: Save these values somewhere safe - you'll need them for Render

## Step 2: Update Callback URL for Production

### 2.1 Add Production Callback URL

Once you have your Render domain:

1. Go back to your GitHub OAuth app settings
2. Update the **"Authorization callback URL"**:
   - Change to: `https://weatherguard-api.onrender.com/api/auth/github/callback`
3. Click **"Update application"**

## Step 3: Add Credentials to Render

### 3.1 Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **weatherguard-api** service
3. Go to **"Environment"** tab
4. Find or add these variables:

   | Variable | Value |
   |----------|-------|
   | `GITHUB_CLIENT_ID` | Paste your Client ID |
   | `GITHUB_CLIENT_SECRET` | Paste your Client Secret |
   | `GITHUB_CALLBACK_URL` | `https://weatherguard-api.onrender.com/api/auth/github/callback` |

5. Click **"Save Changes"**
6. Render will redeploy your API with the new credentials

## Step 4: Test GitHub OAuth

### 4.1 Local Testing

If testing locally:

1. Make sure your API is running: `npm run start:dev` in the `api` directory
2. Make sure your admin is running: `npm run dev` in the `admin` directory
3. Go to `http://localhost:5173`
4. Click **"Continue with GitHub"**
5. You'll be redirected to GitHub login
6. Sign in with your GitHub account
7. Authorize the application when prompted
8. You should be redirected back to the dashboard

### 4.2 Production Testing on Render

1. Go to your admin frontend URL: `https://weatherguard-admin.onrender.com`
2. Click **"Continue with GitHub"**
3. You'll be redirected to GitHub login
4. Sign in with your GitHub account
5. Authorize the application when prompted
6. You should be redirected to the dashboard or pending approval screen

### 4.3 Troubleshooting Login Issues

**Problem**: "Redirect URI mismatch"
- **Solution**: Ensure the callback URL in GitHub exactly matches the one in your API
- Check for trailing slashes and protocol (http vs https)

**Problem**: "Invalid Client ID"
- **Solution**: Verify you copied the correct Client ID from GitHub
- Check that spaces weren't accidentally included

**Problem**: "Application not found"
- **Solution**: Verify the OAuth app still exists in your GitHub settings
- Check that you're using the correct Client ID

## Environment Variables Summary

| Variable | Example Value | Where to Get |
|----------|---------------|--------------|
| `GITHUB_CLIENT_ID` | `Ov23liXXXXXXXXXXXXXX` | GitHub Settings → Developer settings → OAuth Apps |
| `GITHUB_CLIENT_SECRET` | `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | GitHub Settings → Developer settings → OAuth Apps |
| `GITHUB_CALLBACK_URL` | `https://weatherguard-api.onrender.com/api/auth/github/callback` | Your Render API domain |

## Security Best Practices

1. **Never commit secrets**: Don't add Client ID/Secret to version control
2. **Use environment variables**: Always store credentials in environment variables
3. **Rotate credentials**: Periodically regenerate Client Secret
4. **Monitor usage**: Check GitHub for unusual authorization activity
5. **Use HTTPS**: Always use HTTPS URLs in production
6. **Restrict scope**: GitHub OAuth only requests basic user info (no sensitive data)

## Troubleshooting

### "Redirect URI mismatch"

**Cause**: The callback URL in your request doesn't match what's registered on GitHub

**Solution**:
1. Check the exact URL in the error message
2. Go to GitHub Settings → Developer settings → OAuth Apps
3. Click your OAuth app
4. Verify the "Authorization callback URL" matches exactly
5. Update it if needed and click "Update application"

### "Invalid Client ID"

**Cause**: Client ID is incorrect or malformed

**Solution**:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click your OAuth app
3. Copy the Client ID again (make sure no extra spaces)
4. Update it in Render environment variables
5. Redeploy

### "Application not found"

**Cause**: OAuth app was deleted or doesn't exist

**Solution**:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Verify your app is listed
3. If not, create a new OAuth app following the steps above

### "Unauthorized: access denied"

**Cause**: GitHub account doesn't have permission

**Solution**:
1. This is normal for first-time users
2. They need to authorize the application
3. If they deny, they can re-authorize in GitHub Settings → Applications

## Comparing Google vs GitHub OAuth

| Feature | Google OAuth | GitHub OAuth |
|---------|--------------|--------------|
| Setup difficulty | Medium | Easy |
| User base | Very large | Developers |
| Requires email | Yes | Yes |
| Scope control | More granular | Simpler |
| Best for | General apps | Developer tools |

## Next Steps

1. ✅ Google OAuth is set up
2. ✅ GitHub OAuth is now set up
3. ⏭️ Get Telegram Bot Token
4. ⏭️ Get OpenWeatherMap API Key
5. ⏭️ Deploy on Render

## Useful Links

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub OAuth Scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)
- [Passport.js GitHub Strategy](http://www.passportjs.org/packages/passport-github2/)
- [GitHub Developer Settings](https://github.com/settings/developers)

---

**Last Updated**: June 30, 2026
**OAuth 2.0 Standard**: RFC 6749
