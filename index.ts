/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from 'hono';
import { jsx } from 'hono/jsx';

const app = new Hono();

// Persistent in-memory storage (survives deployment within same instance)
let serverData = {
  isOnline: true,
  maxPlayers: 50,
  currentPlayers: 23,
  announcements: ['Welcome to CSRPLA Server!', 'Rules are enforced strictly.'],
  rules: [
    'No RDM (Random Death Match)',
    'No VDM (Vehicle Death Match)',
    'Respect all players and admins',
    'No exploiting or hacking',
    'Follow admin commands',
    'No spam in chat'
  ],
  updateLogs: [
    { date: '2024-01-15', update: 'Added new police station in downtown area' },
    { date: '2024-01-14', update: 'Fixed vehicle physics bugs' },
    { date: '2024-01-13', update: 'Improved server stability and performance' }
  ],
  owners: [
    { name: 'Exo', ingameLink: 'Exo', role: 'Main Owner' }
  ]
};

// API endpoints for data management
app.get('/api/server-data', (c) => {
  return c.json(serverData);
});

app.post('/api/server-data', async (c) => {
  const body = await c.req.json();
  serverData = { ...serverData, ...body };
  return c.json(serverData);
});

app.post('/api/announcements/add', async (c) => {
  const { text } = await c.req.json();
  if (text) {
    serverData.announcements.push(text);
  }
  return c.json(serverData.announcements);
});

app.post('/api/announcements/delete', async (c) => {
  const { index } = await c.req.json();
  serverData.announcements.splice(index, 1);
  return c.json(serverData.announcements);
});

app.post('/api/rules/add', async (c) => {
  const { text } = await c.req.json();
  if (text) {
    serverData.rules.push(text);
  }
  return c.json(serverData.rules);
});

app.post('/api/rules/delete', async (c) => {
  const { index } = await c.req.json();
  serverData.rules.splice(index, 1);
  return c.json(serverData.rules);
});

app.post('/api/updates/add', async (c) => {
  const { date, update } = await c.req.json();
  if (update) {
    serverData.updateLogs.unshift({ date, update });
  }
  return c.json(serverData.updateLogs);
});

app.post('/api/updates/delete', async (c) => {
  const { index } = await c.req.json();
  serverData.updateLogs.splice(index, 1);
  return c.json(serverData.updateLogs);
});

app.post('/api/owners/add', async (c) => {
  const { name, ingameLink, role } = await c.req.json();
  if (name) {
    serverData.owners.push({ name, ingameLink, role });
  }
  return c.json(serverData.owners);
});

app.post('/api/owners/delete', async (c) => {
  const { index } = await c.req.json();
  serverData.owners.splice(index, 1);
  return c.json(serverData.owners);
});

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CSRPLA - ERLC Server</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d4a3d 100%);
          min-height: 100vh;
          color: #f1f5f9;
        }
        
        .admin-btn {
          position: fixed;
          top: 25px;
          right: 25px;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: white;
          font-size: 1.5em;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
          z-index: 100;
        }
        
        .admin-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
        }
        
        /* Modal Styles */
        .modal-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 101;
        }
        
        .modal-overlay.show {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .modal {
          background: linear-gradient(135deg, #1e293b 0%, #0f4c3a 100%);
          border-radius: 16px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          width: 90%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          border-bottom: 2px solid rgba(16, 185, 129, 0.2);
          padding-bottom: 16px;
        }
        
        .modal-header h2 {
          font-size: 1.8em;
          color: #10b981;
          font-weight: 700;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #cbd5e1;
          font-size: 2.2em;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .close-btn:hover {
          color: #10b981;
        }
        
        .password-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .password-input {
          padding: 12px 16px;
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.6);
          color: #f1f5f9;
          font-size: 1em;
          transition: all 0.3s;
        }
        
        .password-input:focus {
          outline: none;
          border-color: #10b981;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
        }
        
        .login-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1em;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
        }
        
        .error-msg {
          color: #ef4444;
          display: none;
          text-align: center;
          font-weight: 600;
        }
        
        .error-msg.show {
          display: block;
        }
        
        .admin-section {
          display: none;
        }
        
        .admin-section.show {
          display: block;
        }
        
        .admin-group {
          margin-bottom: 24px;
        }
        
        .admin-group h3 {
          color: #10b981;
          margin-bottom: 12px;
          font-size: 1.2em;
          font-weight: 700;
        }
        
        .status-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .toggle-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(14, 165, 233, 0.3);
        }
        
        .toggle-btn.offline {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        .toggle-btn.offline:hover {
          box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
        }
        
        .input-group {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        
        .input-group input {
          flex: 1;
          min-width: 140px;
          padding: 10px 14px;
          border: 2px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.6);
          color: #f1f5f9;
          transition: all 0.3s;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #10b981;
          background: rgba(15, 23, 42, 0.8);
        }
        
        .input-group button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .input-group button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
        }
        
        .list-item {
          background: rgba(16, 185, 129, 0.08);
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 3px solid #10b981;
        }
        
        .delete-btn {
          padding: 5px 12px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85em;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .delete-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
        
        .logout-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1em;
          font-weight: 600;
          margin-top: 24px;
          transition: all 0.3s;
        }
        
        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
        }
        
        /* Main Screen Styles */
        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 50px 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .header h1 {
          font-size: 4em;
          margin-bottom: 12px;
          font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .header p {
          font-size: 1.25em;
          color: #94a3b8;
          font-weight: 500;
        }
        
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 24px;
          margin-bottom: 30px;
        }
        
        .card {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 14px;
          padding: 28px;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        
        .card:hover {
          border-color: rgba(16, 185, 129, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(16, 185, 129, 0.15);
        }
        
        .card h2 {
          font-size: 1.6em;
          margin-bottom: 20px;
          color: #0ea5e9;
          font-weight: 700;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .status-item:last-child {
          border-bottom: none;
        }
        
        .status-label {
          font-size: 1em;
          color: #cbd5e1;
          font-weight: 600;
        }
        
        .status-value {
          font-size: 1.4em;
          color: #10b981;
          font-weight: 700;
        }
        
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.95em;
        }
        
        .status-badge.online {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .status-badge.offline {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .announcement-item {
          background: rgba(14, 165, 233, 0.1);
          padding: 14px;
          border-radius: 10px;
          border-left: 3px solid #0ea5e9;
          color: #e2e8f0;
          line-height: 1.5;
        }
        
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .rule-item {
          padding: 12px;
          background: rgba(16, 185, 129, 0.08);
          border-radius: 8px;
          color: #e2e8f0;
          border-left: 3px solid #10b981;
        }
        
        .update-item {
          background: rgba(14, 165, 233, 0.08);
          padding: 14px;
          border-radius: 10px;
          border-left: 3px solid #10b981;
          color: #e2e8f0;
          margin: 10px 0;
        }
        
        .update-date {
          font-size: 0.85em;
          color: #10b981;
          margin-bottom: 6px;
          font-weight: 700;
        }
        
        .owner-item {
          background: rgba(14, 165, 233, 0.08);
          padding: 14px;
          border-radius: 10px;
          border-left: 3px solid #fbbf24;
          color: #e2e8f0;
          margin: 10px 0;
        }
        
        .owner-name {
          font-size: 1.15em;
          font-weight: 700;
          color: #fbbf24;
          margin-bottom: 6px;
        }
        
        .owner-info {
          font-size: 0.95em;
          color: #cbd5e1;
        }
        
        .discord-section {
          grid-column: 1 / -1;
          text-align: center;
        }
        
        .discord-link {
          display: inline-block;
          padding: 14px 40px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-size: 1.1em;
          font-weight: 700;
          transition: all 0.3s;
          margin: 20px 0;
        }
        
        .discord-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(14, 165, 233, 0.3);
        }
        
        .discord-widget {
          margin-top: 28px;
          display: flex;
          justify-content: center;
        }
        
        .discord-widget iframe {
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .info-box {
          background: rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
          padding: 16px;
          border-radius: 10px;
          margin: 16px 0;
          color: #e2e8f0;
          line-height: 1.6;
        }
        
        .info-box strong {
          color: #10b981;
        }
        
        .staff-text {
          color: #cbd5e1;
          margin-bottom: 12px;
          line-height: 1.6;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      </style>
    </head>
    <body>
      <!-- Admin Button -->
      <button class="admin-btn" id="adminBtn" onclick="openAdmin()">⚙️</button>
      
      <!-- Admin Modal -->
      <div class="modal-overlay" id="adminModal">
        <div class="modal">
          <div class="modal-header">
            <h2>Admin Panel</h2>
            <button class="close-btn" onclick="closeAdmin()">×</button>
          </div>
          
          <!-- Login Section -->
          <div id="loginSection" class="password-section">
            <input type="password" id="passwordInput" class="password-input" placeholder="Enter admin password" onkeypress="if(event.key==='Enter') adminLogin()">
            <button class="login-btn" onclick="adminLogin()">Login</button>
            <div class="error-msg" id="errorMsg">❌ Incorrect password</div>
          </div>
          
          <!-- Admin Section -->
          <div id="adminSection" class="admin-section">
            <!-- Server Status -->
            <div class="admin-group">
              <h3>📊 Server Status</h3>
              <div class="status-controls">
                <button class="toggle-btn" id="statusBtn" onclick="toggleStatus()">Online</button>
                <span>Status:</span>
                <span id="statusDisplay" style="font-weight: bold; color: #10b981;">●</span>
              </div>
            </div>
            
            <!-- Player Management -->
            <div class="admin-group">
              <h3>👥 Players</h3>
              <div class="input-group">
                <input type="number" id="playerInput" placeholder="Current players" min="0">
                <button onclick="updatePlayers()">Update</button>
              </div>
              <div class="input-group">
                <input type="number" id="maxPlayerInput" placeholder="Max players" min="1">
                <button onclick="updateMaxPlayers()">Update</button>
              </div>
            </div>
            
            <!-- Announcements -->
            <div class="admin-group">
              <h3>📢 Announcements</h3>
              <div id="announcementsList"></div>
              <div class="input-group">
                <input type="text" id="announcementInput" placeholder="New announcement">
                <button onclick="addAnnouncement()">Add</button>
              </div>
            </div>
            
            <!-- Rules -->
            <div class="admin-group">
              <h3>📋 Rules</h3>
              <div id="rulesList"></div>
              <div class="input-group">
                <input type="text" id="ruleInput" placeholder="New rule">
                <button onclick="addRule()">Add</button>
              </div>
            </div>
            
            <!-- Update Logs -->
            <div class="admin-group">
              <h3>📝 Update Logs</h3>
              <div id="updateLogsList"></div>
              <div class="input-group">
                <input type="date" id="updateDate">
                <input type="text" id="updateText" placeholder="Update description" style="flex: 2;">
                <button onclick="addUpdateLog()">Add</button>
              </div>
            </div>
            
            <!-- Server Owners -->
            <div class="admin-group">
              <h3>👑 Server Owners</h3>
              <div id="ownersList"></div>
              <div class="input-group">
                <input type="text" id="ownerName" placeholder="Owner name">
                <input type="text" id="ownerIngame" placeholder="Ingame name">
                <input type="text" id="ownerRole" placeholder="Role" style="flex: 1;">
                <button onclick="addOwner()">Add</button>
              </div>
            </div>
            
            <button class="logout-btn" onclick="adminLogout()">Logout</button>
          </div>
        </div>
      </div>
      
      <!-- Main Screen -->
      <div class="main-container">
        <div class="header">
          <h1>🎮 CSRPLA</h1>
          <p>Emergency Response: Liberty County Server</p>
        </div>
        
        <div class="cards-grid">
          <!-- Server Status Card -->
          <div class="card">
            <h2>📊 Server Status</h2>
            <div class="status-item">
              <span class="status-label">Status</span>
              <span class="status-badge" id="mainStatusBadge">● Online</span>
            </div>
            <div class="status-item">
              <span class="status-label">Players Online</span>
              <span class="status-value" id="mainPlayerCount">23/50</span>
            </div>
          </div>
          
          <!-- Announcements Card -->
          <div class="card">
            <h2>📢 Announcements</h2>
            <div class="announcements-list" id="mainAnnouncements"></div>
          </div>
          
          <!-- Rules Card -->
          <div class="card">
            <h2>📋 Server Rules</h2>
            <div class="rules-list" id="mainRules"></div>
          </div>
          
          <!-- Server Owners Card -->
          <div class="card">
            <h2>👑 Server Owners</h2>
            <div id="mainOwners"></div>
            <div class="info-box">
              <strong>Ingame Link:</strong> Exo
            </div>
          </div>
          
          <!-- Update Logs Card -->
          <div class="card">
            <h2>📝 Latest Updates</h2>
            <div id="mainUpdateLogs"></div>
          </div>
          
          <!-- Staff Applications Card -->
          <div class="card">
            <h2>👨‍💼 Join Our Staff</h2>
            <p class="staff-text">Interested in joining our staff team? We're always looking for dedicated and responsible members to help manage the server!</p>
            <div class="info-box">
              <strong>How to Apply:</strong> Join our Discord server and submit your application in the staff applications channel. We review all applications regularly.
            </div>
          </div>
          
          <!-- Discord Card -->
          <div class="card discord-section">
            <h2>🔗 Join Our Community</h2>
            <p class="staff-text">Connect with thousands of players and be part of our growing ERLC community on Discord</p>
            <a href="https://discord.com/invite/kNfuceM4?utm_source=Discord%20Widget&utm_medium=Connect" target="_blank" class="discord-link">
              📱 Join Discord Server
            </a>
            <div class="discord-widget">
              <iframe src="https://discord.com/widget?id=1545058845682831433&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        const ADMIN_PASSWORD = '1234567890CSRPLA1234567890';
        let isAdminLoggedIn = false;
        let serverData = null;
        
        // Load data on page load
        window.addEventListener('load', loadServerData);
        
        async function loadServerData() {
          try {
            const response = await fetch('/api/server-data');
            serverData = await response.json();
            renderMainScreen();
          } catch (error) {
            console.error('Error loading server data:', error);
          }
        }
        
        function openAdmin() {
          document.getElementById('adminModal').classList.add('show');
          if (!isAdminLoggedIn) {
            document.getElementById('loginSection').style.display = 'flex';
            document.getElementById('adminSection').classList.remove('show');
          }
        }
        
        function closeAdmin() {
          document.getElementById('adminModal').classList.remove('show');
          if (!isAdminLoggedIn) {
            document.getElementById('passwordInput').value = '';
            document.getElementById('errorMsg').classList.remove('show');
          }
        }
        
        async function adminLogin() {
          const password = document.getElementById('passwordInput').value;
          const errorMsg = document.getElementById('errorMsg');
          
          if (password === ADMIN_PASSWORD) {
            isAdminLoggedIn = true;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminSection').classList.add('show');
            document.getElementById('passwordInput').value = '';
            errorMsg.classList.remove('show');
            renderAdminPanel();
          } else {
            errorMsg.classList.add('show');
            document.getElementById('passwordInput').value = '';
          }
        }
        
        function adminLogout() {
          isAdminLoggedIn = false;
          document.getElementById('adminSection').classList.remove('show');
          document.getElementById('loginSection').style.display = 'flex';
          document.getElementById('passwordInput').value = '';
          closeAdmin();
        }
        
        function renderMainScreen() {
          if (!serverData) return;
          
          // Status
          const statusBadge = document.getElementById('mainStatusBadge');
          statusBadge.textContent = serverData.isOnline ? '● Online' : '● Offline';
          statusBadge.className = serverData.isOnline ? 'status-badge online' : 'status-badge offline';
          
          // Players
          document.getElementById('mainPlayerCount').textContent = serverData.currentPlayers + '/' + serverData.maxPlayers;
          
          // Announcements
          const announcementsContainer = document.getElementById('mainAnnouncements');
          announcementsContainer.innerHTML = serverData.announcements.map(ann => 
            \`<div class="announcement-item">\${ann}</div>\`
          ).join('');
          
          // Rules
          const rulesContainer = document.getElementById('mainRules');
          rulesContainer.innerHTML = serverData.rules.map((rule, i) => 
            \`<div class="rule-item">\${i + 1}. \${rule}</div>\`
          ).join('');
          
          // Owners
          const ownersContainer = document.getElementById('mainOwners');
          ownersContainer.innerHTML = serverData.owners.map(owner => 
            \`<div class="owner-item"><div class="owner-name">\${owner.name}</div><div class="owner-info">Ingame: <strong>\${owner.ingameLink}</strong> | \${owner.role}</div></div>\`
          ).join('');
          
          // Update Logs
          const updateLogsContainer = document.getElementById('mainUpdateLogs');
          updateLogsContainer.innerHTML = serverData.updateLogs.map(log => 
            \`<div class="update-item"><div class="update-date">\${log.date}</div>\${log.update}</div>\`
          ).join('');
        }
        
        function renderAdminPanel() {
          if (!serverData) return;
          
          // Status button
          const statusBtn = document.getElementById('statusBtn');
          statusBtn.textContent = serverData.isOnline ? '✅ Online' : '❌ Offline';
          statusBtn.className = serverData.isOnline ? 'toggle-btn' : 'toggle-btn offline';
          document.getElementById('statusDisplay').textContent = serverData.isOnline ? '●' : '●';
          document.getElementById('statusDisplay').style.color = serverData.isOnline ? '#10b981' : '#ef4444';
          
          // Announcements
          const announcementsList = document.getElementById('announcementsList');
          announcementsList.innerHTML = serverData.announcements.map((ann, i) => 
            \`<div class="list-item"><span>\${ann}</span><button class="delete-btn" onclick="deleteAnnouncement(\${i})">Delete</button></div>\`
          ).join('');
          
          // Rules
          const rulesList = document.getElementById('rulesList');
          rulesList.innerHTML = serverData.rules.map((rule, i) => 
            \`<div class="list-item"><span>\${i + 1}. \${rule}</span><button class="delete-btn" onclick="deleteRule(\${i})">Delete</button></div>\`
          ).join('');
          
          // Update Logs
          const updateLogsList = document.getElementById('updateLogsList');
          updateLogsList.innerHTML = serverData.updateLogs.map((log, i) => 
            \`<div class="list-item"><span><strong>\${log.date}</strong> - \${log.update}</span><button class="delete-btn" onclick="deleteUpdateLog(\${i})">Delete</button></div>\`
          ).join('');
          
          // Owners
          const ownersList = document.getElementById('ownersList');
          ownersList.innerHTML = serverData.owners.map((owner, i) => 
            \`<div class="list-item"><span><strong>\${owner.name}</strong> (\${owner.ingameLink}) - \${owner.role}</span><button class="delete-btn" onclick="deleteOwner(\${i})">Delete</button></div>\`
          ).join('');
        }
        
        async function toggleStatus() {
          serverData.isOnline = !serverData.isOnline;
          await saveServerData();
          renderMainScreen();
          renderAdminPanel();
        }
        
        async function updatePlayers() {
          const input = document.getElementById('playerInput');
          const value = parseInt(input.value);
          if (!isNaN(value) && value >= 0 && value <= serverData.maxPlayers) {
            serverData.currentPlayers = value;
            await saveServerData();
            renderMainScreen();
            input.value = '';
          } else {
            alert('Please enter a valid number between 0 and ' + serverData.maxPlayers);
          }
        }
        
        async function updateMaxPlayers() {
          const input = document.getElementById('maxPlayerInput');
          const value = parseInt(input.value);
          if (!isNaN(value) && value > 0) {
            serverData.maxPlayers = value;
            if (serverData.currentPlayers > value) {
              serverData.currentPlayers = value;
            }
            await saveServerData();
            renderMainScreen();
            input.value = '';
          } else {
            alert('Please enter a valid number greater than 0');
          }
        }
        
        async function addAnnouncement() {
          const input = document.getElementById('announcementInput');
          const text = input.value.trim();
          if (text) {
            try {
              const response = await fetch('/api/announcements/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
              });
              serverData.announcements = await response.json();
              input.value = '';
              renderMainScreen();
              renderAdminPanel();
            } catch (error) {
              console.error('Error adding announcement:', error);
            }
          }
        }
        
        async function deleteAnnouncement(index) {
          try {
            const response = await fetch('/api/announcements/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ index })
            });
            serverData.announcements = await response.json();
            renderMainScreen();
            renderAdminPanel();
          } catch (error) {
            console.error('Error deleting announcement:', error);
          }
        }
        
        async function addRule() {
          const input = document.getElementById('ruleInput');
          const text = input.value.trim();
          if (text) {
            try {
              const response = await fetch('/api/rules/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
              });
              serverData.rules = await response.json();
              input.value = '';
              renderMainScreen();
              renderAdminPanel();
            } catch (error) {
              console.error('Error adding rule:', error);
            }
          }
        }
        
        async function deleteRule(index) {
          try {
            const response = await fetch('/api/rules/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ index })
            });
            serverData.rules = await response.json();
            renderMainScreen();
            renderAdminPanel();
          } catch (error) {
            console.error('Error deleting rule:', error);
          }
        }
        
        async function addUpdateLog() {
          const dateInput = document.getElementById('updateDate');
          const textInput = document.getElementById('updateText');
          const date = dateInput.value;
          const update = textInput.value.trim();
          
          if (date && update) {
            try {
              const response = await fetch('/api/updates/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, update })
              });
              serverData.updateLogs = await response.json();
              dateInput.value = '';
              textInput.value = '';
              renderMainScreen();
              renderAdminPanel();
            } catch (error) {
              console.error('Error adding update log:', error);
            }
          }
        }
        
        async function deleteUpdateLog(index) {
          try {
            const response = await fetch('/api/updates/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ index })
            });
            serverData.updateLogs = await response.json();
            renderMainScreen();
            renderAdminPanel();
          } catch (error) {
            console.error('Error deleting update log:', error);
          }
        }
        
        async function addOwner() {
          const nameInput = document.getElementById('ownerName');
          const ingameInput = document.getElementById('ownerIngame');
          const roleInput = document.getElementById('ownerRole');
          const name = nameInput.value.trim();
          const ingameLink = ingameInput.value.trim();
          const role = roleInput.value.trim();
          
          if (name && ingameLink && role) {
            try {
              const response = await fetch('/api/owners/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, ingameLink, role })
              });
              serverData.owners = await response.json();
              nameInput.value = '';
              ingameInput.value = '';
              roleInput.value = '';
              renderMainScreen();
              renderAdminPanel();
            } catch (error) {
              console.error('Error adding owner:', error);
            }
          }
        }
        
        async function deleteOwner(index) {
          try {
            const response = await fetch('/api/owners/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ index })
            });
            serverData.owners = await response.json();
            renderMainScreen();
            renderAdminPanel();
          } catch (error) {
            console.error('Error deleting owner:', error);
          }
        }
        
        async function saveServerData() {
          try {
            await fetch('/api/server-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(serverData)
            });
          } catch (error) {
            console.error('Error saving server data:', error);
          }
        }
      </script>
    </body>
    </html>
  `);
});

export default app;
