# Telegram Bot & OpenWeatherMap API Setup Guide for WeatherGuard

This guide walks you through setting up the Telegram Bot and OpenWeatherMap API for the WeatherGuard application.

## Part 1: Telegram Bot Setup

### What is Telegram Bot?

Telegram Bot is a bot that runs on Telegram Messenger and sends weather alerts to users. Users link their Telegram account to WeatherGuard, and the bot sends them daily weather updates.

### Prerequisites for Telegram Bot

- Telegram account (download from [telegram.org](https://telegram.org))
- Access to Telegram on your phone or desktop
- Your Render API domain (e.g., `https://weatherguard-api.onrender.com`)

## Step 1: Create Telegram Bot

### 1.1 Talk to BotFather

1. Open Telegram
2. Search for **@BotFather** (official Telegram bot creator)
3. Click on it and click **"Start"**
4. You'll see a list of commands

### 1.2 Create New Bot

1. Send the command: `/newbot`
2. BotFather will ask: **"Alright! New bot. How are we going to call it? Please choose a name for your bot."**
3. Reply with a name (e.g., `WeatherGuard Bot` or `WeatherGuard Alert Bot`)
   - This is the display name users see
4. BotFather will ask: **"Good. Now let's choose a username for your bot. It must end in 'bot'."**
5. Reply with a username (e.g., `weatherguard_bot` or `weatherguard_alerts_bot`)
   - This must be unique and end with `_bot` or `bot`
   - This is what users search for to find your bot

### 1.3 Get Your Bot Token

1. BotFather will send you a message like:
   ```
   Done! Congratulations on your new bot. You will find it at t.me/weatherguard_bot.
   You can now add a description, about section and profile picture for your bot, see /help for a list of commands.
   
   Use this token to access the HTTP API:
   123456789:ABCDefGHIjklmnoPQRstUVwxyz
   ```

2. **Important**: Copy and save the token (the long string after the colon)
   - This is your `TELEGRAM_BOT_TOKEN`
   - Keep it secret - don't share it!

### 1.4 Set Bot Commands (Optional but Recommended)

1. Send to BotFather: `/setcommands`
2. Select your bot from the list
3. Send the following commands:
   ```
   link - Link your Telegram account to WeatherGuard
   setcity - Set your city for weather alerts
   help - Show help information
   ```

### 1.5 Set Bot Description (Optional)

1. Send to BotFather: `/setdescription`
2. Select your bot
3. Enter a description:
   ```
   WeatherGuard sends you daily weather alerts for your city. Link your account to get started!
   ```

## Step 2: Add Telegram Token to Render

### 2.1 Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **weatherguard-api** service
3. Go to **"Environment"** tab
4. Find or add the variable:

   | Variable | Value |
   |----------|-------|
   | `TELEGRAM_BOT_TOKEN` | Paste your bot token from BotFather |

5. Click **"Save Changes"**
6. Render will redeploy your API with the new token

## Step 3: Test Telegram Bot

### 3.1 Find Your Bot

1. Open Telegram
2. Search for your bot username (e.g., `@weatherguard_bot`)
3. Click on it
4. Click **"Start"**

### 3.2 Test Bot Commands

1. Send: `/link YOUR_TOKEN_HERE`
   - Replace `YOUR_TOKEN_HERE` with the token you get from the admin dashboard
   - The bot should respond with a confirmation

2. Send: `/setcity New York`
   - The bot should confirm the city is set

3. Send: `/help`
   - The bot should show available commands

### 3.3 Troubleshooting Bot Issues

**Problem**: Bot doesn't respond
- **Solution**: 
  1. Check that `TELEGRAM_BOT_TOKEN` is set correctly in Render
  2. Check API logs for errors
  3. Verify bot token is still valid (hasn't been regenerated)

**Problem**: "Invalid token"
- **Solution**:
  1. Go back to BotFather
  2. Send `/mybots` to see your bots
  3. Click on your bot
  4. Click "API Token"
  5. Copy the token again and update Render

**Problem**: Bot sends errors instead of alerts
- **Solution**:
  1. Check that user has linked their Telegram account
  2. Check that user has set a city
  3. Check API logs for specific error messages

---

## Part 2: OpenWeatherMap API Setup

### What is OpenWeatherMap?

OpenWeatherMap provides current weather data for any city in the world. WeatherGuard uses this API to fetch weather information and send alerts to users.

### Prerequisites for OpenWeatherMap

- Email address
- Internet connection
- Your Render API domain (for webhook configuration, if needed)

## Step 1: Create OpenWeatherMap Account

### 1.1 Sign Up

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click **"Sign Up"** (top right)
3. Fill in the registration form:
   - **Username**: Your preferred username
   - **Email**: Your email address
   - **Password**: Strong password
   - **Confirm Password**: Same password
4. Accept the terms and conditions
5. Click **"Create Account"**

### 1.2 Verify Email

1. Check your email for a verification link from OpenWeatherMap
2. Click the verification link
3. You'll be redirected to confirm your account

### 1.3 Log In

1. Go to [OpenWeatherMap](https://openweathermap.org/)
2. Click **"Sign In"**
3. Enter your credentials
4. Click **"Sign In"**

## Step 2: Get API Key

### 2.1 Access API Keys

1. After logging in, click your username (top right) → **"My API Keys"**
2. You'll see your **Default API Key** (already generated)
3. Copy this key - it looks like: `abcdef1234567890abcdef1234567890`

### 2.2 Create Additional Key (Optional)

If you want a separate key for production:

1. Click **"Create key"**
2. Enter a name (e.g., `WeatherGuard Production`)
3. Click **"Generate"**
4. Copy the new key

## Step 3: Add API Key to Render

### 3.1 Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **weatherguard-api** service
3. Go to **"Environment"** tab
4. Find or add the variable:

   | Variable | Value |
   |----------|-------|
   | `OPENWEATHER_API_KEY` | Paste your API key from OpenWeatherMap |

5. Click **"Save Changes"**
6. Render will redeploy your API with the new key

## Step 4: Test OpenWeatherMap API

### 4.1 Test API Locally

If testing locally:

```bash
# Replace YOUR_API_KEY with your actual key
curl "https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=YOUR_API_KEY"
```

You should get a JSON response with weather data.

### 4.2 Test via WeatherGuard

1. Go to your admin dashboard
2. Create a user and approve them
3. Have them link their Telegram account
4. Have them set a city
5. Trigger a manual alert:
   ```bash
   curl -X POST https://weatherguard-api.onrender.com/api/scheduler/trigger \
     -H "Cookie: access_token=YOUR_JWT_TOKEN"
   ```
6. Check if the Telegram bot sends a weather alert

### 4.3 Troubleshooting API Issues

**Problem**: "Invalid API key"
- **Solution**:
  1. Verify you copied the key correctly
  2. Check for extra spaces or characters
  3. Go to OpenWeatherMap and copy again

**Problem**: "City not found"
- **Solution**:
  1. Use standard city names (e.g., "New York", not "NYC")
  2. Try with country code (e.g., "New York, US")
  3. Check OpenWeatherMap documentation for city names

**Problem**: "API rate limit exceeded"
- **Solution**:
  1. Free tier has 60 calls/minute limit
  2. Wait a minute and try again
  3. Consider upgrading to a paid plan for higher limits

## OpenWeatherMap Free Tier Details

| Feature | Free Tier | Paid |
|---------|-----------|------|
| Current Weather | ✅ Yes | ✅ Yes |
| Forecasts | ❌ No | ✅ Yes |
| Historical Data | ❌ No | ✅ Yes |
| API Calls/Minute | 60 | Higher |
| Price | Free | $0.01+ per call |

## Environment Variables Summary

| Variable | Example Value | Where to Get |
|----------|---------------|--------------|
| `TELEGRAM_BOT_TOKEN` | `123456789:ABCDefGHIjklmnoPQRstUVwxyz` | @BotFather on Telegram |
| `OPENWEATHER_API_KEY` | `abcdef1234567890abcdef1234567890` | OpenWeatherMap → My API Keys |

## Security Best Practices

1. **Never commit secrets**: Don't add tokens/keys to version control
2. **Use environment variables**: Always store credentials in environment variables
3. **Rotate keys**: Periodically regenerate API keys
4. **Monitor usage**: Check OpenWeatherMap dashboard for unusual activity
5. **Telegram token**: Keep your bot token secret - don't share it publicly
6. **Rate limiting**: Monitor API usage to avoid exceeding rate limits

## Testing Checklist

- [ ] Telegram bot responds to `/start`
- [ ] Telegram bot responds to `/link`
- [ ] Telegram bot responds to `/setcity`
- [ ] OpenWeatherMap API key works
- [ ] Weather data is fetched correctly
- [ ] Telegram alerts are sent to users
- [ ] Admin can trigger manual alerts

## Troubleshooting Summary

| Issue | Solution |
|-------|----------|
| Bot doesn't respond | Check token in Render, verify API is running |
| Invalid API key | Copy key again from OpenWeatherMap, check for spaces |
| City not found | Use standard city names, try with country code |
| Rate limit exceeded | Wait a minute, check API usage, consider upgrading |
| No alerts sent | Verify user linked Telegram, set city, check logs |

## Next Steps

1. ✅ MongoDB Atlas is set up
2. ✅ Google OAuth is set up
3. ✅ GitHub OAuth is set up
4. ✅ Telegram Bot is set up
5. ✅ OpenWeatherMap API is set up
6. ⏭️ Deploy on Render
7. ⏭️ Test the complete application

## Useful Links

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram BotFather](https://t.me/botfather)
- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [OpenWeatherMap Weather API](https://openweathermap.org/current)
- [OpenWeatherMap City List](https://openweathermap.org/find)

---

**Last Updated**: June 30, 2026
**Telegram Bot API**: Official Telegram Bot API
**OpenWeatherMap**: Free Weather API
