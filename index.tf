/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from 'hono';
import { jsx } from 'hono/jsx';
import { handle } from '@vercel/node';

const app = new Hono();

// --- GOOGLE SITE VERIFICATION ROUTE ---
app.get('/googlea1ccd6a3af2c2d7c.html', (c) => {
  return c.text('google-site-verification: googlea1ccd6a3af2c2d7c.html');
});

// Persistent in-memory storage
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
app.get('/api/server-data', (c) => c.json(serverData));

app.post('/api/server-data', async (c) => {
  const body = await c.req.json();
  serverData = { ...serverData, ...body };
  return c.json(serverData);
});

app.post('/api/announcements/add', async (c) => {
  const { text } = await c.req.json();
  if (text) serverData.announcements.push(text);
  return c.json(serverData.announcements);
});

app.post('/api/announcements/delete', async (c) => {
  const { index } = await c.req.json();
  serverData.announcements.splice(index, 1);
  return c.json(serverData.announcements);
});

app.post('/api/rules/add', async (c) => {
  const { text } = await c.req.json();
  if (text) serverData.rules.push(text);
  return c.json(serverData.rules);
});

app.post('/api/rules/delete', async (c) => {
  const { index } = await c.req.json();
  serverData.rules.splice(index, 1);
  return c.json(serverData.rules);
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d4a3d 100%);
          min-height: 100vh;
          color: #f1f5f9;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
        .container { text-align: center; padding: 40px; background: rgba(30, 41, 59, 0.7); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.2); }
        h1 { color: #10b981; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>CSRPLA Server Hub</h1>
        <p>Your server is currently online with ${serverData.currentPlayers}/${serverData.maxPlayers} players.</p>
      </div>
    </body>
    </html>
  `);
});

// Vercel Serverless Function entry point handler
export default handle(app);
