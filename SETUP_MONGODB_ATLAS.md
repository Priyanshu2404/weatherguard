# MongoDB Atlas Setup Guide for WeatherGuard

This guide walks you through setting up a free MongoDB Atlas cluster for the WeatherGuard application.

## What is MongoDB Atlas?

MongoDB Atlas is a fully managed cloud database service. The free tier (M0) provides:
- 512 MB of storage
- Shared multi-tenant cluster
- Perfect for development and small production apps
- No credit card required for the free tier

## Prerequisites

- Email address for MongoDB account
- Internet connection
- Access to your email for verification

## Step 1: Create MongoDB Atlas Account

### 1.1 Sign Up

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Choose your sign-up method:
   - Email/Password (recommended)
   - Google account
   - GitHub account
4. Fill in the registration form:
   - First Name
   - Last Name
   - Email
   - Password (if using email signup)
   - Accept terms and conditions
5. Click **"Create your Atlas account"**

### 1.2 Verify Email

1. Check your email for a verification link from MongoDB
2. Click the verification link
3. You'll be redirected to complete your profile

### 1.3 Complete Organization Setup

1. You'll see "Create an organization" screen
2. Organization Name: `WeatherGuard` (or your preferred name)
3. Click **"Create Organization"**
4. You'll be prompted to create a project

## Step 2: Create a Project

### 2.1 Create New Project

1. Click **"Create a Project"**
2. Project Name: `WeatherGuard` or `WeatherGuard-Dev`
3. Click **"Create Project"**

### 2.2 Create a Cluster

1. Click **"Build a Database"**
2. Select **"M0 Free"** tier (it's already highlighted)
3. Click **"Create"** (or **"Create Cluster"**)

### 2.3 Configure Cluster

1. **Cloud Provider & Region**:
   - Provider: AWS (recommended, most regions available)
   - Region: Choose based on your location or Render deployment region
     - For US: `us-east-1` (N. Virginia)
     - For Europe: `eu-west-1` (Ireland)
     - For Asia: `ap-southeast-1` (Singapore)
   - Click **"Create Cluster"**

2. Wait for cluster creation (usually 2-5 minutes)
   - You'll see a progress indicator
   - Status will change from "Creating" to "Active"

## Step 3: Create Database User

### 3.1 Add Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Fill in the form:
   - **Authentication Method**: Password (selected by default)
   - **Username**: `weatherguard_user`
   - **Password**: Click **"Autogenerate Secure Password"** or create your own
     - If creating your own, use a strong password (mix of uppercase, lowercase, numbers, symbols)
     - **Important**: Save this password somewhere safe - you'll need it for the connection string
   - **Database User Privileges**: Select **"Built-in Role"** → **"Atlas Admin"**
4. Click **"Add User"**

### 3.2 Add IP Whitelist

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Choose one of these options:

   **Option A: Allow from Anywhere (Recommended for Development)**
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` to the whitelist
   - Click **"Confirm"**
   - ⚠️ **Security Note**: This is fine for development but not recommended for production

   **Option B: Add Render IP Range (More Secure)**
   - Click **"Add IP Address"**
   - In the "IP Address" field, enter: `0.0.0.0/0` (Render uses dynamic IPs)
   - Description: `Render Deployment`
   - Click **"Confirm"**

4. Wait for the change to propagate (usually a few seconds)

## Step 4: Get Connection String

### 4.1 Connect to Cluster

1. Go to your cluster page (click **"Clusters"** in the left sidebar)
2. Click the **"Connect"** button on your cluster card
3. You'll see three connection options:
   - Connect with MongoDB Compass
   - Connect your application
   - Connect via mongosh

### 4.2 Get Connection String

1. Click **"Connect your application"**
2. Select:
   - **Driver**: Node.js
   - **Version**: 5.9 or later (latest)
3. You'll see a connection string that looks like:
   ```
   mongodb+srv://weatherguard_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 4.3 Customize Connection String

1. **Replace `<password>`** with your actual database user password
2. **Add database name** before the query parameters:
   ```
   mongodb+srv://weatherguard_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/weatherguard?retryWrites=true&w=majority
   ```
3. Copy the complete connection string

## Step 5: Set Up Render Environment Variable

### 5.1 In Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **weatherguard-api** service
3. Go to **"Environment"** tab
4. Find or add the `MONGODB_URI` variable
5. Paste your complete connection string:
   ```
   mongodb+srv://weatherguard_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/weatherguard?retryWrites=true&w=majority
   ```
6. Click **"Save Changes"**
7. Render will redeploy your API with the new connection

## Verification

### 5.2 Verify Connection

1. Go to your **weatherguard-api** service logs
2. Look for the message: `API server listening on port 10000`
3. If you see this without errors, your MongoDB connection is working!

### 5.3 Check MongoDB Atlas

1. Go back to MongoDB Atlas
2. Click **"Collections"** on your cluster
3. You should see a new database `weatherguard` with collections:
   - `users` (created when first user signs up)
   - Other collections as the app runs

## Troubleshooting

### Connection Timeout

**Problem**: `MongooseError: connect ECONNREFUSED` or timeout error

**Solutions**:
1. Verify password is correct in connection string (check for special characters)
2. Check IP whitelist includes your Render region
3. Ensure cluster is in "Active" state (not "Creating" or "Paused")
4. Try connecting from MongoDB Compass to test locally

### Authentication Failed

**Problem**: `MongooseError: Authentication failed`

**Solutions**:
1. Double-check username and password in connection string
2. Verify database user exists in "Database Access" section
3. Ensure password doesn't have special characters that need URL encoding
4. Try resetting the password in MongoDB Atlas

### Database Not Found

**Problem**: Collections not appearing in MongoDB Atlas

**Solutions**:
1. Check that the API is actually running (check logs)
2. Verify at least one user has signed up
3. Try triggering a manual alert: `curl -X POST https://your-api.onrender.com/api/scheduler/trigger`
4. Check API logs for any database write errors

## Next Steps

1. ✅ MongoDB Atlas is now set up
2. ⏭️ Set up OAuth credentials (Google and GitHub)
3. ⏭️ Get Telegram Bot Token
4. ⏭️ Get OpenWeatherMap API Key
5. ⏭️ Deploy on Render

## Useful Links

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Connection String Documentation](https://docs.mongodb.com/manual/reference/connection-string/)
- [Mongoose Connection Guide](https://mongoosejs.com/docs/connections.html)
- [MongoDB Atlas Security Best Practices](https://docs.atlas.mongodb.com/security/)

## Security Best Practices

1. **Use Strong Passwords**: Generate complex passwords for database users
2. **Limit IP Access**: In production, whitelist only your Render IP range
3. **Use Read-Only Users**: Create separate users with limited permissions for different services
4. **Enable MFA**: Enable multi-factor authentication on your MongoDB Atlas account
5. **Rotate Passwords Regularly**: Change database passwords periodically
6. **Use VPC Peering**: For production, consider using VPC peering instead of IP whitelist

---

**Last Updated**: June 30, 2026
**MongoDB Atlas Free Tier**: M0 (512 MB storage)
