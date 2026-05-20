const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, '..', 'data');
const csvPath = path.join(dataDir, 'testData.csv');

app.post('/submit-name', (req, res) => {
  try {
    const nameRaw = req.body && req.body.name ? String(req.body.name) : '';
    const name = nameRaw.replace(/[\r\n,]/g, ' ').trim();
    if (!name) return res.status(400).json({ error: 'Name required' });
    const timestamp = new Date().toISOString();
    const line = `${name},${timestamp}\n`;
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
      fs.writeFileSync(csvPath, 'name,timestamp\n', { encoding: 'utf8' });
    }
    fs.appendFileSync(csvPath, line, { encoding: 'utf8' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to write CSV:', err);
    return res.status(500).json({ error: 'Failed to write CSV' });
  }
});

// Serve frontend static files
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

const port = process.env.PORT || 3000;
// Listen on all network interfaces so the server is reachable from other machines
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`Server listening on http://${host}:${port}`));
