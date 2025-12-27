# Email Subscription Feature — TODO

## 1. Functional Requirements

### User-Facing (Frontend)
- [x] **Email input field** — A form with a text input for email address and a "Subscribe" button
- [x] **Validation** — Client-side email format validation before submission
- [x] **Feedback states** — Visual feedback for: submitting, success, already subscribed, and error states
- [x] **Design consistency** — The subscription box should match the minimal aesthetic of the current site

### Backend (API)
- [x] **Subscribe endpoint** — `POST /api/subscribe` to add an email to the subscribers list
- [x] **Email verification** — Send a confirmation email with a unique link to verify ownership (prevents abuse)
- [x] **Duplicate handling** — Gracefully handle already-subscribed emails
- [x] **Unsubscribe endpoint** — `POST /api/unsubscribe` or a tokenized `GET` link for one-click unsubscribe
- [x] **Rate limiting** — Prevent spam/abuse (e.g., max 5 requests per IP per minute)

### State Change Notifications
- [x] **Admin trigger mechanism** — A way for you to update the status (e.g., "Yes" → "No") and trigger notification emails
- [x] **Broadcast endpoint** — `POST /api/notify` (authenticated) to send emails to all verified subscribers
- [x] **Email content** — Clear, simple message like: *"Update: Matej is no longer single!"* with an unsubscribe link

---

## 2. Data Storage Requirements
- [x] **Subscriber records** — Store: email, verification status, verification token, subscribe date, unsubscribe token
- [x] **Current status** — Store the current relationship status ("Yes", "No", "It's complicated", etc.)

**Cloudflare options:**
- ~~**KV** — Simple key-value, good for small scale~~
- **D1** — SQLite database ✓

---

## 3. Email Service Requirements
- [x] **Transactional email provider** — Resend (free tier: 3,000 emails/month)
- [x] **Required emails:**
  - Verification email (on subscribe)
  - Status update email (on state change)
- [x] **Unsubscribe footer** — Required by CAN-SPAM/GDPR in every email

---

## 4. Security & Privacy Requirements
- [x] **No plain-text tokens in URLs** — Use secure, unguessable tokens for verify/unsubscribe links
- [x] **Admin authentication** — Protect the notify/broadcast endpoint (API key or auth)
- [x] **GDPR compliance** — Privacy notice on what you do with emails, ability to delete data on request
- [x] **HTTPS only** — All endpoints served over TLS (handled by Cloudflare)

---

## 5. Non-Functional Requirements
- [x] **Scalability** — Handle up to ~10,000 subscribers (D1 handles this easily)
- [x] **Reliability** — Email delivery with retry logic for failures
- [x] **Logging** — Track subscribe/unsubscribe events and email delivery status

---

## 6. Nice-to-Have (Future Enhancements)
- [ ] **Subscription count display** — "Join 1,234 others waiting for updates"
- [ ] **Admin dashboard** — View subscriber count, send manual updates
- [ ] **Email templates** — Branded, responsive HTML emails

---

## Tech Stack

| Component | Choice |
|-----------|--------|
| API | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Email | Resend (free tier: 3,000 emails/month) |
| Frontend | Vanilla JS form in `index.html` |

---

## Execution Plan

### Phase 1: Project Setup ✅
- [x] Initialize Cloudflare Workers with Hono framework
- [x] Set up D1 database binding in `wrangler.jsonc`
- [x] Create database schema for subscribers
- [ ] Set up Resend account and get API key *(manual step)*

### Phase 2: Core Backend ✅
- [x] Create `POST /api/subscribe` endpoint
- [x] Create `GET /api/verify/:token` endpoint
- [x] Create `GET /api/unsubscribe/:token` endpoint
- [x] Implement email sending with Resend
- [x] Add rate limiting middleware

### Phase 3: Admin Features ✅
- [x] Create `POST /api/admin/notify` endpoint (authenticated)
- [x] Create `POST /api/admin/status` endpoint to update current status
- [x] Create `GET /api/admin/stats` endpoint for subscriber stats

### Phase 4: Frontend ✅
- [x] Add subscription form to `index.html`
- [x] Style form to match minimal aesthetic
- [x] Add JavaScript for form submission and feedback states
- [x] Create verification success/error pages
- [x] Create unsubscribe confirmation page

### Phase 5: Email Templates ✅
- [x] Design verification email
- [x] Design status update email
- [x] Include unsubscribe links in all emails

### Phase 6: Testing & Deployment ✅
- [x] Documentation in README.md
- [ ] Test locally with `wrangler dev` *(ready to run)*
- [ ] Create D1 database in Cloudflare dashboard *(manual step)*
- [ ] Add secrets (RESEND_API_KEY, ADMIN_API_KEY) *(manual step)*
- [ ] Deploy with `wrangler deploy` *(manual step)*
- [ ] End-to-end testing on production *(manual step)*

---

## Environment Variables / Secrets Needed

```bash
wrangler secret put RESEND_API_KEY    # API key from Resend
wrangler secret put ADMIN_API_KEY     # Secret key for admin endpoints
wrangler secret put SITE_URL          # https://ismatejsingle.com
```

---

## Files Created

```
├── src/
│   ├── index.ts      # Main Hono app with all API routes
│   ├── utils.ts      # Token generation, email validation, rate limiting
│   ├── email.ts      # Resend email functions
│   └── pages.ts      # HTML pages for verify/unsubscribe
├── public/
│   └── index.html    # Frontend with subscription form
├── schema.sql        # D1 database schema
├── wrangler.jsonc    # Cloudflare Workers config
├── tsconfig.json     # TypeScript config
└── package.json      # Dependencies and scripts
```
