export function renderAdminPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin | Is Matej Single?</title>
  <style>
    :root {
      --bg: #f5f5f5;
      --card-bg: #fff;
      --text: #111;
      --text-muted: #666;
      --border: #e0e0e0;
      --primary: #111;
      --primary-text: #fff;
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0a0a0a;
        --card-bg: #1a1a1a;
        --text: #fff;
        --text-muted: #999;
        --border: #333;
        --primary: #fff;
        --primary-text: #111;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 24px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    h1 { font-size: 24px; font-weight: 600; }
    .logout-btn {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 14px;
    }
    .logout-btn:hover { border-color: var(--text); color: var(--text); }
    
    /* Login form */
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }
    .login-card {
      background: var(--card-bg);
      padding: 32px;
      border-radius: 12px;
      border: 1px solid var(--border);
      width: 100%;
      max-width: 360px;
    }
    .login-card h2 { margin-bottom: 24px; font-size: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label {
      display: block;
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text);
      font-size: 16px;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: var(--text);
    }
    .btn {
      padding: 10px 20px;
      background: var(--primary);
      color: var(--primary-text);
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
    }
    
    /* Cards */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .card h2 {
      font-size: 16px;
      color: var(--text-muted);
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    }
    .stat {
      text-align: center;
      padding: 16px;
      background: var(--bg);
      border-radius: 8px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-verified .stat-value { color: var(--success); }
    .stat-pending .stat-value { color: var(--warning); }
    
    /* Status display */
    .current-status {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .status-value {
      font-size: 48px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .status-updated {
      font-size: 12px;
      color: var(--text-muted);
    }
    
    /* Table */
    .table-container { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid var(--border);
    }
    th {
      font-weight: 500;
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tr:last-child td { border-bottom: none; }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-verified { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    @media (prefers-color-scheme: dark) {
      .badge-verified { background: #166534; color: #dcfce7; }
      .badge-pending { background: #92400e; color: #fef3c7; }
    }
    
    /* Actions */
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    
    /* Notify form */
    .notify-form { margin-top: 16px; }
    .notify-form textarea { min-height: 80px; resize: vertical; }
    .notify-actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      align-items: center;
    }
    
    /* Messages */
    .message {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .message-success { background: #dcfce7; color: #166534; }
    .message-error { background: #fee2e2; color: #991b1b; }
    @media (prefers-color-scheme: dark) {
      .message-success { background: #166534; color: #dcfce7; }
      .message-error { background: #991b1b; color: #fee2e2; }
    }
    
    .hidden { display: none !important; }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Login Screen -->
    <div id="loginScreen" class="login-container">
      <div class="login-card">
        <h2>Admin Login</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="apiKey">Admin API Key</label>
            <input type="password" id="apiKey" placeholder="Enter your admin API key" required>
          </div>
          <button type="submit" class="btn" style="width: 100%">Login</button>
        </form>
        <p id="loginError" class="message message-error hidden" style="margin-top: 16px;"></p>
      </div>
    </div>

    <!-- Dashboard -->
    <div id="dashboard" class="hidden">
      <header>
        <h1>Is Matej Single? Admin</h1>
        <button class="logout-btn" onclick="logout()">Logout</button>
      </header>

      <div id="globalMessage" class="message hidden"></div>

      <!-- Current Status -->
      <div class="card">
        <h2>Current Status</h2>
        <div class="current-status">
          <span id="statusValue" class="status-value">-</span>
          <span id="statusUpdated" class="status-updated"></span>
        </div>
        <div class="actions" style="margin-top: 16px;">
          <button class="btn btn-secondary" onclick="showUpdateStatus()">Update Status</button>
        </div>
        <div id="updateStatusForm" class="notify-form hidden">
          <div class="form-group">
            <label for="newStatus">New Status</label>
            <select id="newStatus">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="It's complicated">It's complicated</option>
            </select>
          </div>
          <div class="notify-actions">
            <button class="btn" onclick="updateStatus()">Save</button>
            <button class="btn btn-secondary" onclick="hideUpdateStatus()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="card">
        <h2>Subscribers</h2>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-value" id="totalCount">-</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat stat-verified">
            <div class="stat-value" id="verifiedCount">-</div>
            <div class="stat-label">Verified</div>
          </div>
          <div class="stat stat-pending">
            <div class="stat-value" id="pendingCount">-</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </div>

      <!-- Send Notification -->
      <div class="card">
        <h2>Send Notification</h2>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px;">
          Send an email to all verified subscribers about the current status.
        </p>
        <div class="form-group">
          <label for="notifyMessage">Custom Message (optional)</label>
          <textarea id="notifyMessage" placeholder="e.g., Big news everyone!"></textarea>
        </div>
        <button class="btn" onclick="sendNotification()" id="notifyBtn">
          Send to <span id="notifyCount">0</span> subscribers
        </button>
      </div>

      <!-- Subscriber List -->
      <div class="card">
        <h2>Subscriber List</h2>
        <div class="table-container">
          <table id="subscriberTable">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody id="subscriberList">
              <tr><td colspan="3" class="empty-state">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    let apiKey = localStorage.getItem('adminApiKey') || '';

    // Check if already logged in
    if (apiKey) {
      checkAuth();
    }

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      apiKey = document.getElementById('apiKey').value;
      await checkAuth();
    });

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': 'Bearer ' + apiKey }
        });
        if (res.ok) {
          localStorage.setItem('adminApiKey', apiKey);
          document.getElementById('loginScreen').classList.add('hidden');
          document.getElementById('dashboard').classList.remove('hidden');
          loadDashboard();
        } else {
          showLoginError('Invalid API key');
          localStorage.removeItem('adminApiKey');
        }
      } catch (err) {
        showLoginError('Connection error');
      }
    }

    function showLoginError(msg) {
      const el = document.getElementById('loginError');
      el.textContent = msg;
      el.classList.remove('hidden');
    }

    function logout() {
      localStorage.removeItem('adminApiKey');
      apiKey = '';
      document.getElementById('dashboard').classList.add('hidden');
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('apiKey').value = '';
      document.getElementById('loginError').classList.add('hidden');
    }

    async function loadDashboard() {
      // Load stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': 'Bearer ' + apiKey }
      });
      const stats = await statsRes.json();

      document.getElementById('totalCount').textContent = stats.subscribers?.total || 0;
      document.getElementById('verifiedCount').textContent = stats.subscribers?.verified || 0;
      document.getElementById('pendingCount').textContent = stats.subscribers?.pending || 0;
      document.getElementById('notifyCount').textContent = stats.subscribers?.verified || 0;

      document.getElementById('statusValue').textContent = stats.currentStatus?.status || 'Yes';
      if (stats.currentStatus?.updated_at) {
        const date = new Date(stats.currentStatus.updated_at + 'Z');
        document.getElementById('statusUpdated').textContent = 'Updated ' + date.toLocaleDateString();
      }

      // Load subscriber list
      const listRes = await fetch('/api/admin/subscribers', {
        headers: { 'Authorization': 'Bearer ' + apiKey }
      });
      const list = await listRes.json();

      const tbody = document.getElementById('subscriberList');
      if (!list.subscribers || list.subscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No subscribers yet</td></tr>';
      } else {
        tbody.innerHTML = list.subscribers.map(s => {
          const date = new Date(s.created_at + 'Z').toLocaleDateString();
          const badge = s.verified 
            ? '<span class="badge badge-verified">Verified</span>'
            : '<span class="badge badge-pending">Pending</span>';
          return '<tr><td>' + escapeHtml(s.email) + '</td><td>' + badge + '</td><td>' + date + '</td></tr>';
        }).join('');
      }
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function showMessage(msg, isError = false) {
      const el = document.getElementById('globalMessage');
      el.textContent = msg;
      el.className = 'message ' + (isError ? 'message-error' : 'message-success');
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 5000);
    }

    function showUpdateStatus() {
      document.getElementById('updateStatusForm').classList.remove('hidden');
    }

    function hideUpdateStatus() {
      document.getElementById('updateStatusForm').classList.add('hidden');
    }

    async function updateStatus() {
      const newStatus = document.getElementById('newStatus').value;
      try {
        const res = await fetch('/api/admin/status', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          showMessage('Status updated to "' + newStatus + '"');
          hideUpdateStatus();
          loadDashboard();
        } else {
          const data = await res.json();
          showMessage(data.error || 'Failed to update status', true);
        }
      } catch (err) {
        showMessage('Connection error', true);
      }
    }

    async function sendNotification() {
      const btn = document.getElementById('notifyBtn');
      const message = document.getElementById('notifyMessage').value;

      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        const res = await fetch('/api/admin/notify', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: message || undefined })
        });
        const data = await res.json();
        if (res.ok) {
          showMessage('Sent ' + data.sent + ' emails' + (data.failed ? ' (' + data.failed + ' failed)' : ''));
          document.getElementById('notifyMessage').value = '';
        } else {
          showMessage(data.error || 'Failed to send notifications', true);
        }
      } catch (err) {
        showMessage('Connection error', true);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send to ' + document.getElementById('notifyCount').textContent + ' subscribers';
      }
    }
  </script>
</body>
</html>
  `.trim();
}
