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
    { name: 'Exo', ingameLinkk: 'Exo', role: 'Main Owner' }
  ]
};

// Google site verification route
app.get('/googlea1ccd6a3af2c2d7c.html', (c) => {
  return c.text('google-site-verification: googlea1ccd6a3af2c2d7c.html');
});

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
  const { name, ingameLinkk, role } = await c.req.json();
  if (name) {
    serverData.owners.push({ name, ingameLinkk, role });
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
      </style>
    </head>
    <body>
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px;">
        <div style="background: rgba(30, 41, 59, 0.7); padding: 40px; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.2); text-align: center; max-width: 500px; width: 100%;">
          <h1 style="color: #10b981; margin-bottom: 15px;">CSRPLA Server Hub</h1>
          <p style="margin-bottom: 10px;">Status: <span style="color: #10b981; font-weight: bold;">ONLINE</span></p>
          <p>Players: ${serverData.currentPlayers} / ${serverData.maxPlayers}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Native Deno entrypoint configuration handler
export default app;
