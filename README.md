# ismatejsingle.com

A simple site that displays Matej's relationship status, with email subscriptions for updates.

## Features

- 📱 Minimal, responsive design with dark mode support
- 📧 Email subscription system for status updates
- ✅ Double opt-in email verification
- 🔒 Admin API for status updates and notifications
- ⚡ Deployed on Cloudflare Workers with D1 database

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Email**: Resend
- **Language**: TypeScript

---

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Run locally (uses local D1 database)
npm run dev
```

---

## Deployment Guide

### Step 1: Create Cloudflare D1 Database

```bash
# Create the database
npm run db:create
```

This will output a database ID. Copy it.

### Step 2: Update `wrangler.jsonc`

Replace `YOUR_DATABASE_ID_HERE` with your actual database ID:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "is-matej-single-db",
    "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
]
```

### Step 3: Run Database Migrations

```bash
# For local development
npm run db:migrate:local

# For production
npm run db:migrate
```

### Step 4: Set Up Resend

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your domain (`ismatejsingle.com`)
3. Create an API key

### Step 5: Configure Secrets

```bash
# Resend API key for sending emails
wrangler secret put RESEND_API_KEY
# Paste your Resend API key

# Admin API key (generate a secure random string)
wrangler secret put ADMIN_API_KEY
# Paste your chosen admin key

# Site URL for verification links
wrangler secret put SITE_URL
# Enter: https://ismatejsingle.com
```

### Step 6: Deploy

```bash
npm run deploy
```

### Step 7: Add Custom Domain

1. Go to Cloudflare Dashboard → Workers & Pages → your worker
2. Click "Settings" → "Domains & Routes"
3. Add custom domain: `ismatejsingle.com`

---

## API Reference

### Public Endpoints

#### `GET /api/status`
Returns the current relationship status.

```json
{ "status": "Yes" }
```

#### `POST /api/subscribe`
Subscribe to status updates.

```bash
curl -X POST https://ismatejsingle.com/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

#### `GET /api/verify/:token`
Verify email subscription (from email link).

#### `GET /api/unsubscribe/:token`
Unsubscribe from updates (from email link).

### Admin Endpoints

All admin endpoints require the `Authorization: Bearer <ADMIN_API_KEY>` header.

#### `POST /api/admin/status`
Update the current status.

```bash
curl -X POST https://ismatejsingle.com/api/admin/status \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "No"}'
```

#### `POST /api/admin/notify`
Send email notification to all verified subscribers.

```bash
curl -X POST https://ismatejsingle.com/api/admin/notify \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Big news!"}'
```

#### `GET /api/admin/stats`
Get subscriber statistics.

```bash
curl https://ismatejsingle.com/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_KEY"
```

Response:
```json
{
  "subscribers": { "total": 150, "verified": 142, "pending": 8 },
  "currentStatus": { "status": "Yes", "updated_at": "2025-01-01T00:00:00Z" }
}
```

---

## Updating the Status

When Matej's relationship status changes:

```bash
# 1. Update the status
curl -X POST https://ismatejsingle.com/api/admin/status \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "No"}'

# 2. Notify all subscribers
curl -X POST https://ismatejsingle.com/api/admin/notify \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "After years of being single, Matej has found love!"}'
```

**Note:** Also update the `<h1>` text in `public/index.html` and redeploy.

---

## Security Notes

- All tokens (verify/unsubscribe) are 64-character hex strings generated with `crypto.getRandomValues()`
- Rate limiting: 5 requests per minute per IP on subscribe endpoint
- Admin endpoints are protected with API key authentication
- HTTPS enforced by Cloudflare

---

## License

ISC
