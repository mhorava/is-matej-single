import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateToken, validateEmail, createRateLimiter } from './utils';
import { sendVerificationEmail, sendStatusUpdateEmail } from './email';
import {
  renderVerifySuccessPage,
  renderVerifyErrorPage,
  renderUnsubscribeSuccessPage,
  renderUnsubscribeErrorPage,
} from './pages';

type Bindings = {
  DB: D1Database;
  RESEND_API_KEY: string;
  ADMIN_API_KEY: string;
  SITE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Rate limiter: max 5 requests per minute per IP
const rateLimiter = createRateLimiter(5, 60000);

// CORS for API routes
app.use('/api/*', cors());

// ============================================
// PUBLIC ENDPOINTS
// ============================================

// Get current status
app.get('/api/status', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT status FROM site_status WHERE id = 1'
  ).first<{ status: string }>();

  return c.json({ status: result?.status || 'Yes' });
});

// Subscribe to updates
app.post('/api/subscribe', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';

  // Rate limiting
  if (!rateLimiter.check(ip)) {
    return c.json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  const body = await c.req.json<{ email: string }>();
  const email = body.email?.toLowerCase().trim();

  // Validate email
  if (!email || !validateEmail(email)) {
    return c.json({ error: 'Please provide a valid email address.' }, 400);
  }

  // Check if already subscribed
  const existing = await c.env.DB.prepare(
    'SELECT id, verified FROM subscribers WHERE email = ?'
  ).bind(email).first<{ id: number; verified: number }>();

  if (existing) {
    if (existing.verified) {
      return c.json({ message: 'You are already subscribed!' }, 200);
    } else {
      // Resend verification email
      const verifyToken = generateToken();
      await c.env.DB.prepare(
        'UPDATE subscribers SET verify_token = ? WHERE id = ?'
      ).bind(verifyToken, existing.id).run();

      await sendVerificationEmail(
        c.env.RESEND_API_KEY,
        email,
        `${c.env.SITE_URL}/api/verify/${verifyToken}`
      );

      return c.json({ message: 'Verification email resent. Please check your inbox.' }, 200);
    }
  }

  // Create new subscriber
  const verifyToken = generateToken();
  const unsubscribeToken = generateToken();

  await c.env.DB.prepare(
    'INSERT INTO subscribers (email, verify_token, unsubscribe_token) VALUES (?, ?, ?)'
  ).bind(email, verifyToken, unsubscribeToken).run();

  // Send verification email
  await sendVerificationEmail(
    c.env.RESEND_API_KEY,
    email,
    `${c.env.SITE_URL}/api/verify/${verifyToken}`
  );

  return c.json({ message: 'Please check your email to confirm your subscription.' }, 201);
});

// Verify email subscription
app.get('/api/verify/:token', async (c) => {
  const token = c.req.param('token');

  const subscriber = await c.env.DB.prepare(
    'SELECT id, email, verified FROM subscribers WHERE verify_token = ?'
  ).bind(token).first<{ id: number; email: string; verified: number }>();

  if (!subscriber) {
    return c.html(renderVerifyErrorPage('Invalid or expired verification link.'));
  }

  if (subscriber.verified) {
    return c.html(renderVerifySuccessPage(subscriber.email, true));
  }

  // Mark as verified
  await c.env.DB.prepare(
    "UPDATE subscribers SET verified = 1, verified_at = datetime('now') WHERE id = ?"
  ).bind(subscriber.id).run();

  return c.html(renderVerifySuccessPage(subscriber.email, false));
});

// Unsubscribe
app.get('/api/unsubscribe/:token', async (c) => {
  const token = c.req.param('token');

  const subscriber = await c.env.DB.prepare(
    'SELECT id, email FROM subscribers WHERE unsubscribe_token = ?'
  ).bind(token).first<{ id: number; email: string }>();

  if (!subscriber) {
    return c.html(renderUnsubscribeErrorPage('Invalid unsubscribe link.'));
  }

  // Delete subscriber
  await c.env.DB.prepare('DELETE FROM subscribers WHERE id = ?')
    .bind(subscriber.id)
    .run();

  return c.html(renderUnsubscribeSuccessPage(subscriber.email));
});

// ============================================
// ADMIN ENDPOINTS (Protected)
// ============================================

// Middleware for admin authentication
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey || apiKey !== c.env.ADMIN_API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
};

// Update status
app.post('/api/admin/status', adminAuth, async (c) => {
  const body = await c.req.json<{ status: string }>();
  const newStatus = body.status?.trim();

  if (!newStatus) {
    return c.json({ error: 'Status is required.' }, 400);
  }

  await c.env.DB.prepare(
    "UPDATE site_status SET status = ?, updated_at = datetime('now') WHERE id = 1"
  ).bind(newStatus).run();

  return c.json({ message: 'Status updated successfully.', status: newStatus });
});

// Send notification to all subscribers
app.post('/api/admin/notify', adminAuth, async (c) => {
  const body = await c.req.json<{ status?: string; message?: string }>();

  // Get current status if not provided
  let status = body.status;
  if (!status) {
    const result = await c.env.DB.prepare(
      'SELECT status FROM site_status WHERE id = 1'
    ).first<{ status: string }>();
    status = result?.status || 'Yes';
  }

  // Get all verified subscribers
  const subscribers = await c.env.DB.prepare(
    'SELECT email, unsubscribe_token FROM subscribers WHERE verified = 1'
  ).all<{ email: string; unsubscribe_token: string }>();

  if (!subscribers.results || subscribers.results.length === 0) {
    return c.json({ message: 'No verified subscribers to notify.', sent: 0 });
  }

  // Send emails to all subscribers
  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers.results) {
    try {
      await sendStatusUpdateEmail(
        c.env.RESEND_API_KEY,
        subscriber.email,
        status,
        `${c.env.SITE_URL}/api/unsubscribe/${subscriber.unsubscribe_token}`,
        body.message
      );
      sent++;
    } catch (error) {
      console.error(`Failed to send to ${subscriber.email}:`, error);
      failed++;
    }
  }

  return c.json({
    message: `Notifications sent.`,
    sent,
    failed,
    total: subscribers.results.length,
  });
});

// Get subscriber stats
app.get('/api/admin/stats', adminAuth, async (c) => {
  const stats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified,
      SUM(CASE WHEN verified = 0 THEN 1 ELSE 0 END) as pending
    FROM subscribers
  `).first<{ total: number; verified: number; pending: number }>();

  const status = await c.env.DB.prepare(
    'SELECT status, updated_at FROM site_status WHERE id = 1'
  ).first<{ status: string; updated_at: string }>();

  return c.json({
    subscribers: stats,
    currentStatus: status,
  });
});

export default app;
