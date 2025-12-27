const baseStyles = `
  :root { color-scheme: light dark; }
  body {
    margin: 0;
    min-height: 100svh;
    display: grid;
    place-items: center;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    padding: 20px;
    box-sizing: border-box;
  }
  .container {
    text-align: center;
    max-width: 400px;
  }
  h1 {
    font-size: clamp(32px, 8vw, 48px);
    letter-spacing: -0.02em;
    margin: 0 0 16px;
  }
  p {
    font-size: 18px;
    line-height: 1.6;
    margin: 0 0 24px;
    opacity: 0.7;
  }
  a {
    display: inline-block;
    padding: 12px 24px;
    background: #111;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
  }
  @media (prefers-color-scheme: dark) {
    a { background: #fff; color: #111; }
  }
`;

function wrapPage(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Is Matej Single?</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
  `.trim();
}

export function renderVerifySuccessPage(email: string, alreadyVerified: boolean): string {
  const message = alreadyVerified
    ? `<strong>${email}</strong> was already verified.`
    : `<strong>${email}</strong> has been verified!`;

  return wrapPage(
    'Subscribed',
    `
    <h1>✓ You're In!</h1>
    <p>${message} You'll receive an email when Matej's status changes.</p>
    <a href="/">Back to Home</a>
    `
  );
}

export function renderVerifyErrorPage(message: string): string {
  return wrapPage(
    'Verification Failed',
    `
    <h1>Oops!</h1>
    <p>${message}</p>
    <a href="/">Back to Home</a>
    `
  );
}

export function renderUnsubscribeSuccessPage(email: string): string {
  return wrapPage(
    'Unsubscribed',
    `
    <h1>Goodbye!</h1>
    <p><strong>${email}</strong> has been unsubscribed. You won't receive any more updates.</p>
    <a href="/">Back to Home</a>
    `
  );
}

export function renderUnsubscribeErrorPage(message: string): string {
  return wrapPage(
    'Unsubscribe Failed',
    `
    <h1>Oops!</h1>
    <p>${message}</p>
    <a href="/">Back to Home</a>
    `
  );
}
