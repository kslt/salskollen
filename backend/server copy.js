const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// =========================
// RUM / CHECKPOINTS
// =========================
app.get('/api/rooms', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms ORDER BY id');
    for (const room of rooms) {
      const [groups] = await db.query(
        'SELECT * FROM checkpointGroups WHERE room_id = ? ORDER BY position',
        [room.id]
      );
      for (const group of groups) {
        const [checkpoints] = await db.query(
          'SELECT * FROM checkpoints WHERE group_id = ? ORDER BY position',
          [group.id]
        );
        group.checkpoints = checkpoints;
      }
      room.checkpointGroups = groups;
    }
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta rum' });
  }
});

// =========================
// RUNDOR
// =========================
app.post('/api/rounds', async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO rounds (name, created_at) VALUES (?, NOW())',
      [name || null]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte skapa runda' });
  }
});

app.get('/api/rounds', async (req, res) => {
  try {
    const [rounds] = await db.query('SELECT * FROM rounds ORDER BY created_at DESC');
    res.json(rounds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta rundor' });
  }
});

// =========================
// KONTROLLER
// =========================
app.post('/api/checks', async (req, res) => {
  const { checkpoint_id, status, reason, round_id } = req.body;
  try {
    await db.query(
      'INSERT INTO checks (checkpoint_id, status, reason, created_at, round_id) VALUES (?, ?, ?, NOW(), ?)',
      [checkpoint_id, status, reason || null, round_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte spara kontroll' });
  }
});

app.get('/api/checks', async (req, res) => {
  const { round_id } = req.query;
  try {
    const [checks] = await db.query(
      `SELECT ck.*, c.name AS checkpoint_name, g.name AS group_name, r.name AS room_name, c.group_id
       FROM checks ck
       JOIN checkpoints c ON ck.checkpoint_id = c.id
       JOIN checkpointGroups g ON c.group_id = g.id
       JOIN rooms r ON g.room_id = r.id
       WHERE ck.round_id = ?`,
      [round_id]
    );
    res.json(checks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta checks' });
  }
});

// =========================
// PDF
// =========================
app.get('/api/report/:round_id', async (req, res) => {
  const { round_id } = req.params;
  try {
    const [[round]] = await db.query('SELECT * FROM rounds WHERE id = ?', [round_id]);
    const [checks] = await db.query(
      `SELECT r.name AS room, g.name AS groupName, c.name AS checkpoint, ck.status, ck.reason
       FROM checks ck
       JOIN checkpoints c ON ck.checkpoint_id = c.id
       JOIN checkpointGroups g ON c.group_id = g.id
       JOIN rooms r ON g.room_id = r.id
       WHERE ck.round_id = ?
       ORDER BY r.id, g.position, g.id, c.position, c.id`,
      [round_id]
    );

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Egenkontrollrapport', { align: 'center' });
    if (round.name) doc.fontSize(14).text(`Runda: ${round.name}`, { align: 'center' });
    doc.fontSize(12).text(`Datum: ${new Date(round.created_at).toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    let currentRoom = '', currentGroup = '';
    checks.forEach(item => {
      if (item.room !== currentRoom) {
        currentRoom = item.room;
        doc.fontSize(16).fillColor('black').text(`\n${currentRoom}`, { underline: true });
        currentGroup = '';
      }
      if (item.groupName !== currentGroup) {
        currentGroup = item.groupName;
        doc.fontSize(14).fillColor('black').text(`\n  ${currentGroup}`);
      }
      const statusColor = item.status === 'ok' ? 'green' : 'red';
      doc.fillColor(statusColor).text(`    - ${item.checkpoint}: ${item.status.toUpperCase()}`);
      if (item.reason) doc.fillColor('black').text(`      Orsak: ${item.reason}`);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte generera rapport' });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
