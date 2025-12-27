const FROM_EMAIL = 'Is Matej Single <noreply@ismatejsingle.com>';

interface ResendResponse {
  id?: string;
  error?: { message: string };
}

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ResendResponse;
    throw new Error(`Failed to send email: ${error.error?.message || response.statusText}`);
  }
}

export async function sendVerificationEmail(
  apiKey: string,
  email: string,
  verifyUrl: string
): Promise<void> {
  const subject = 'Confirm your subscription to Is Matej Single?';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 600; color: #111;">Is Matej Single?</h1>
    
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333;">
      Thanks for subscribing! Please confirm your email address to receive updates when Matej's relationship status changes.
    </p>
    
    <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background-color: #111; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
      Confirm Subscription
    </a>
    
    <p style="margin: 24px 0 0; font-size: 14px; color: #666; line-height: 1.5;">
      If you didn't subscribe, you can safely ignore this email.
    </p>
    
    <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
    
    <p style="margin: 0; font-size: 12px; color: #999;">
      This email was sent by ismatejsingle.com
    </p>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(apiKey, email, subject, html);
}

export async function sendStatusUpdateEmail(
  apiKey: string,
  email: string,
  status: string,
  unsubscribeUrl: string,
  customMessage?: string
): Promise<void> {
  const subject = `Update: Is Matej Single? → ${status}`;

  // Generate appropriate message based on status
  let statusMessage: string;
  if (status.toLowerCase() === 'yes') {
    statusMessage = "Matej is single! 💔";
  } else if (status.toLowerCase() === 'no') {
    statusMessage = "Matej is no longer single! 💕";
  } else {
    statusMessage = `Matej's status: ${status}`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 600; color: #111;">Is Matej Single?</h1>
    
    <div style="margin: 0 0 24px; padding: 24px; background: #f8f8f8; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 48px; font-weight: 700; color: #111; letter-spacing: -0.02em;">
        ${status}
      </p>
    </div>
    
    <p style="margin: 0 0 16px; font-size: 18px; line-height: 1.6; color: #333;">
      ${statusMessage}
    </p>
    
    ${customMessage ? `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555;">
      ${customMessage}
    </p>
    ` : ''}
    
    <a href="https://ismatejsingle.com" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background-color: #111; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
      Visit Website
    </a>
    
    <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
    
    <p style="margin: 0; font-size: 12px; color: #999;">
      You received this because you subscribed to ismatejsingle.com updates.<br>
      <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `.trim();

  await sendEmail(apiKey, email, subject, html);
}
