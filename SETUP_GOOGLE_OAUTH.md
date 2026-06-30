# Google OAuth Setup Guide for WeatherGuard

This guide walks you through setting up Google OAuth 2.0 authentication for the WeatherGuard application.

## What is Google OAuth?

OAuth 2.0 is an authorization framework that allows users to sign in using their Google account without sharing their password with WeatherGuard. It's secure, convenient, and industry-standard.

## Prerequisites

- Google account (Gmail or Google Workspace)
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your Render API domain (e.g., `https://weatherguard-api.onrender.com`)

## Step 1: Create a Google Cloud Project

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. If you see a welcome screen, click **"Select a Project"** or **"Create a Project"**

### 1.2 Create New Project

1. Click the project dropdown at the top (currently shows "My First Project" or similar)
2. Click **"NEW PROJECT"**
3. Fill in the form:
   - **Project Name**: `WeatherGuard` or `WeatherGuard-OAuth`
   - **Organization**: Leave blank or select your organization
   - **Location**: Leave as default
4. Click **"CREATE"**
5. Wait for the project to be created (usually 30 seconds to 1 minute)
6. You'll see a notification "Project created successfully"

### 1.3 Select Your Project

1. Click the project dropdown again
2. Click on your newly created project
3. You should now see your project name at the top

## Step 2: Enable Google+ API

### 2.1 Enable the API

1. In the left sidebar, click **"APIs & Services"**
2. Click **"Library"**
3. Search for **"Google+ API"** in the search box
4. Click on **"Google+ API"** from the results
5. Click the blue **"ENABLE"** button
6. Wait for it to enable (you'll see a checkmark)

## Step 3: Create OAuth 2.0 Credentials

### 3.1 Create OAuth Consent Screen

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** as the User Type (this allows any Google account to sign in)
3. Click **"CREATE"**
4. Fill in the OAuth consent screen form:

   **App Information**:
   - **App name**: `WeatherGuard`
   - **User support email**: Your email address
   - **App logo**: (Optional) You can skip this

   **Developer contact information**:
   - **Email addresses**: Your email address
   - Click **"SAVE AND CONTINUE"**

5. **Scopes** (next screen):
   - Click **"ADD OR REMOVE SCOPES"**
   - Search for and select these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

6. **Test users** (next screen):
   - Click **"ADD USERS"**
   - Add your email address as a test user
   - This allows you to test login during development
   - Click **"SAVE AND CONTINUE"**

7. Review and click **"BACK TO DASHBOARD"**

### 3.2 Create OAuth Client ID

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (top button)
3. Select **"OAuth client ID"**
4. If prompted to create an OAuth consent screen first, follow the steps above
5. Select **"Web application"** as the application type
6. Fill in the form:

   **Name**: `WeatherGuard Web Client` or similar

   **Authorized JavaScript origins** (where requests come from):
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000` (for local development)
   - Click **"+ ADD URI"**
   - Add: `https://weatherguard-api.onrender.com` (your Render API domain)

   **Authorized redirect URIs** (where users are sent after login):
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000/api/auth/google/callback` (local development)
   - Click **"+ ADD URI"**
   - Add: `https://weatherguard-api.onrender.com/api/auth/google/callback` (Render production)

7. Click **"CREATE"**

### 3.3 Copy Your Credentials

1. A popup will appear with your credentials
2. **Important**: Copy and save these values:
   - **Client ID**: (looks like `123456789-abcdefg.apps.googleusercontent.com`)
   - **Client Secret**: (looks like `GOCSPX-xxxxxxxxxxxxxxx`)
3. Click **"CLOSE"** to dismiss the popup

## Step 4: Add Credentials to Render

### 4.1 Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **weatherguard-api** service
3. Go to **"Environment"** tab
4. Find or add these variables:

   | Variable | Value |
   |----------|-------|
   | `GOOGLE_CLIENT_ID` | Paste your Client ID |
   | `GOOGLE_CLIENT_SECRET` | Paste your Client Secret |
   | `GOOGLE_CALLBACK_URL` | `https://weatherguard-api.onrender.com/api/auth/google/callback` |

5. Click **"Save Changes"**
6. Render will redeploy your API with the new credentials

## Step 5: Test Google OAuth

### 5.1 Local Testing

If testing locally:

1. Make sure your API is running: `npm run start:dev` in the `api` directory
2. Make sure your admin is running: `npm run dev` in the `admin` directory
3. Go to `http://localhost:5173`
4. Click **"Continue with Google"**
5. You'll be redirected to Google login
6. Sign in with your Google account
7. Grant permissions when prompted
8. You should be redirected back to the dashboard

### 5.2 Production Testing on Render

1. Go to your admin frontend URL: `https://weatherguard-admin.onrender.com`
2. Click **"Continue with Google"**
3. You'll be redirected to Google login
4. Sign in with your Google account
5. Grant permissions when prompted
6. You should be redirected to the dashboard or pending approval screen

### 5.3 Troubleshooting Login Issues

**Problem**: "Redirect URI mismatch"
- **Solution**: Ensure the redirect URI in Google Cloud Console exactly matches the one in your API
- Check for trailing slashes and protocol (http vs https)

**Problem**: "Invalid Client ID"
- **Solution**: Verify you copied the correct Client ID from Google Cloud Console
- Check that spaces weren't accidentally included

**Problem**: "Access Denied"
- **Solution**: Make sure your email is added as a test user in the OAuth consent screen
- Or publish the app (not recommended for development)

## Step 6: Update Redirect URIs for Production

### 6.1 When You Have Your Final Domain

Once you know your final Render domain:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth Client ID
4. Add your final production URIs:
   - **Authorized JavaScript origins**: Add your production domain
   - **Authorized redirect URIs**: Add `https://your-domain.com/api/auth/google/callback`
5. Click **"SAVE"**

## Environment Variables Summary

| Variable | Example Value | Where to Get |
|----------|---------------|--------------|
| `GOOGLE_CLIENT_ID` | `123456789-abcdefg.apps.googleusercontent.com` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxxxx` | Google Cloud Console → Credentials |
| `GOOGLE_CALLBACK_URL` | `https://weatherguard-api.onrender.com/api/auth/google/callback` | Your Render API domain |

## Security Best Practices

1. **Never commit secrets**: Don't add Client ID/Secret to version control
2. **Use environment variables**: Always store credentials in environment variables
3. **Restrict origins**: Only add domains you actually use
4. **Rotate credentials**: Periodically regenerate Client Secret
5. **Monitor usage**: Check Google Cloud Console for unusual activity
6. **Use HTTPS**: Always use HTTPS URLs in production

## Troubleshooting

### "The redirect_uri parameter does not match"

**Cause**: The redirect URI in your request doesn't match what's registered in Google Cloud Console

**Solution**:
1. Check the exact URL in the error message
2. Go to Google Cloud Console → Credentials
3. Click your OAuth Client ID
4. Verify the redirect URI matches exactly (including protocol and path)
5. Add it if it's missing

### "Invalid client_id"

**Cause**: Client ID is incorrect or malformed

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Copy the Client ID again (make sure no extra spaces)
3. Update it in Render environment variables
4. Redeploy

### "Access Denied" or "User not authorized"

**Cause**: Your email isn't added as a test user

**Solution**:
1. Go to Google Cloud Console → OAuth consent screen
2. Click **"Test users"**
3. Click **"ADD USERS"**
4. Add your email address
5. Click **"SAVE"**

## Next Steps

1. ✅ Google OAuth is now set up
2. ⏭️ Set up GitHub OAuth (similar process)
3. ⏭️ Get Telegram Bot Token
4. ⏭️ Get OpenWeatherMap API Key
5. ⏭️ Deploy on Render

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)

---

**Last Updated**: June 30, 2026
**OAuth 2.0 Standard**: RFC 6749
