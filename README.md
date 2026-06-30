# WeatherGuard Admin

A secure, invite-only weather alert service. Users request access via social login; an admin approves them through a web dashboard; approved users receive automated weather alerts through a Telegram bot.

---

## System Design

### Database Schema

**`users` collection**

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | string | Full name from OAuth provider |
| `email` | string | Unique email address |
| `avatar` | string \| null | Profile picture URL |
| `provider` | `google` \| `github` | OAuth provider used to sign up |
| `providerId` | string | Provider-specific user ID |
| `role` | `user` \| `admin` | Assigned on first login (admin if email matches `ADMIN_EMAIL` env var) |
| `status` | `pending` \| `approved` \| `rejected` | Approval workflow state |
| `telegramChatId` | string \| null | Telegram chat ID, set after the user links their account |
| `telegramUsername` | string \| null | Telegram `@username` |
| `city` | string \| null | City used for weather queries |
| `telegramLinkToken` | string \| null | One-time UUID token generated on approval, used to link Telegram |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

**`weatherAlerts` (implicit)** — alerts are delivered via Telegram and not persisted by default. Extend `SchedulerService` to write to a collection if you need an audit log.

---

## Data Flow

### 1. Sign-up and access request

```
User clicks "Continue with Google/GitHub"
  -> NestJS OAuth redirect via Passport.js
  -> Callback: findOrCreate user in MongoDB
  -> If email == ADMIN_EMAIL: role=admin, status=approved
  -> Otherwise: role=user, status=pending
  -> JWT issued, stored as httpOnly cookie
  -> Frontend redirects based on status (pending -> waiting screen)
```

### 2. Admin approval

```
Admin views /dashboard -> GET /api/users (admin-only)
Admin clicks "Approve" -> PATCH /api/users/:id/status { status: "approved" }
  -> UsersService.updateStatus generates a telegramLinkToken (UUID v4)
  -> Token is stored on the user record and shown in the dashboard table
  -> Admin shares the token with the user (or user sees it on their settings page)
```

### 3. Telegram account linking

```
Approved user opens their Settings page
  -> Sees: /link <token>
User sends that command to @YourBotUsername on Telegram
  -> TelegramService bot handler receives the message
  -> Looks up user by telegramLinkToken
  -> Sets telegramChatId + telegramUsername on the user record
  -> Clears the used token
  -> Prompts user to set city: /setcity <city>
```

### 4. Weather alerts (scheduled)

```
node-cron fires at 08:00 and 20:00 daily
  -> SchedulerService.sendWeatherAlerts()
  -> UsersService.findApprovedWithTelegram()
     (status=approved AND telegramChatId != null AND city != null)
  -> Group users by city (deduplicate API calls)
  -> For each city: WeatherService.getCurrentWeather(city)
     -> OpenWeatherMap /data/2.5/weather?q=<city>&units=metric
  -> For each user in that city: TelegramService.sendWeatherAlert(chatId, data)
```

**Only approved users with a linked Telegram and a configured city ever receive alerts.** The three-field gate (`status`, `telegramChatId`, `city`) in the DB query is the enforcement point.

---

## Project Structure

```
weatherguard/
├── api/                    # NestJS
│   ├── src/
│   │   ├── auth/           # OAuth strategies (Google, GitHub), JWT, guards
│   │   ├── users/          # Schema, service, controller, DTOs
│   │   ├── telegram/       # Telegraf bot, /link and /setcity handlers
│   │   ├── weather/        # OpenWeatherMap API client
│   │   ├── scheduler/      # node-cron job + admin trigger endpoint
│   │   ├── common/         # Decorators (@CurrentUser, @Roles), interfaces
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── admin/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # useUsers, useUpdateCity (React Query)
│   │   ├── pages/          # LoginPage, PendingPage, DashboardPage, SettingsPage
│   │   ├── components/     # Navbar, StatusBadge, LoadingSpinner
│   │   ├── App.tsx         # Route guard logic
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- MongoDB 6+ (or Docker)
- A [Google Cloud OAuth app](https://console.cloud.google.com/) with a Web client credential
- A [GitHub OAuth app](https://github.com/settings/developers)
- A [Telegram bot token](https://core.telegram.org/bots#botfather) from @BotFather
- An [OpenWeatherMap API key](https://openweathermap.org/api) (free tier is sufficient)

### Local setup (without Docker)

**1. Clone and install**

```bash
git clone <your-repo-url>
cd weatherguard
```

**2. Configure the API**

```bash
cd api
cp .env.example .env
# Fill in all values in .env
npm install
npm run start:dev
```

**3. Configure the admin**

```bash
cd ../admin
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Local setup (with Docker)

```bash
# Copy and fill in env file first
cp api/.env.example api/.env

docker-compose up --build
```

- Admin panel: http://localhost:5173
- API: http://localhost:3000

### Environment variables reference

See [`api/.env.example`](./api/.env.example) for all required variables.

The most important ones:

| Variable | Purpose |
|---|---|
| `ADMIN_EMAIL` | The email address that will automatically receive `role=admin` on first login |
| `JWT_SECRET` | Long random string used to sign JWT tokens |
| `TELEGRAM_BOT_TOKEN` | Token from @BotFather |
| `OPENWEATHER_API_KEY` | Free tier key from openweathermap.org |

### Triggering a demo alert manually

Once an approved user has linked their Telegram and set a city, an admin can trigger alerts immediately without waiting for the cron schedule:

```bash
curl -X POST http://localhost:3000/api/scheduler/trigger \
  -H "Cookie: access_token=<your_admin_jwt>"
```

Or use the "Dispatch Alerts" button in the admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | NestJS 10, TypeScript |
| Auth | Passport.js (Google OAuth 2.0, GitHub OAuth, JWT) |
| Database | MongoDB 7, Mongoose |
| Telegram | Telegraf v4 |
| Weather | OpenWeatherMap Current Weather API |
| Scheduler | @nestjs/schedule (node-cron under the hood) |
| Frontend | React 18, Vite, Tailwind CSS v3, React Query v5 |
| Deployment | Docker + Nginx |
