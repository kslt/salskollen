const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// =========================
// Admin API
// =========================

app.get('/api/admin/rooms', async (req, res) => {
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

app.post('/api/admin/room', async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query('INSERT INTO rooms (name) VALUES (?)', [name]);
  res.json({ id: result.insertId });
});

app.put('/api/admin/room/:id', async (req, res) => {
  const { name } = req.body;
  await db.query('UPDATE rooms SET name = ? WHERE id = ?', [name, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/admin/room/:id', async (req, res) => {
  await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.post('/api/admin/group', async (req, res) => {
  const { room_id, name } = req.body;
  const [result] = await db.query(
    'INSERT INTO checkpointGroups (room_id, name, position) VALUES (?, ?, 0)',
    [room_id, name]
  );
  res.json({ id: result.insertId });
});

app.put('/api/admin/group/:id', async (req, res) => {
  const { name } = req.body;
  await db.query('UPDATE checkpointGroups SET name = ? WHERE id = ?', [name, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/admin/group/:id', async (req, res) => {
  await db.query('DELETE FROM checkpointGroups WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.post('/api/admin/checkpoint', async (req, res) => {
  const { group_id, name } = req.body;

  try {
    const [[row]] = await db.query(
      'SELECT COALESCE(MAX(position), -1) AS maxPos FROM checkpoints WHERE group_id = ?',
      [group_id]
    );

    const nextPosition = row.maxPos + 1;

    const [result] = await db.query(
      'INSERT INTO checkpoints (group_id, name, position) VALUES (?, ?, ?)',
      [group_id, name, nextPosition]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte skapa checkpoint' });
  }
});

app.put('/api/admin/checkpoint/:id', async (req, res) => {
  const { name } = req.body;
  await db.query('UPDATE checkpoints SET name = ? WHERE id = ?', [name, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/admin/checkpoint/:id', async (req, res) => {
  await db.query('DELETE FROM checkpoints WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.put('/api/admin/checkpoint/:id/move', async (req, res) => {
  const { group_id, position } = req.body;
  await db.query('UPDATE checkpoints SET group_id = ?, position = ? WHERE id = ?', [
    group_id,
    position,
    req.params.id,
  ]);
  res.json({ success: true });
});

// =========================
// ADMIN – RUNDOR
// =========================
app.get('/api/admin/rounds', async (req, res) => {
  try {
    const [rounds] = await db.query(
      'SELECT id, name, created_at FROM rounds ORDER BY created_at DESC'
    );
    res.json(rounds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte hämta rundor' });
  }
});

app.delete('/api/admin/round/:id', async (req, res) => {
  const roundId = req.params.id;

  try {
    await db.query('DELETE FROM checks WHERE round_id = ?', [roundId]);
    await db.query('DELETE FROM rounds WHERE id = ?', [roundId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunde inte ta bort runda' });
  }
});

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
function stripEmojis(text = '') {
  return text.replace(
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
    ''
  ).trim();
}

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

    const imgWidth = 100;
    doc.image('img/header/visitlogo.png', doc.page.margins.left, doc.page.margins.top, { width: imgWidth });

    const date = new Date(round.created_at);
    const formattedDate = date.toISOString().split('T')[0];

    doc.fontSize(20).text('Salskollen - rapport', { align: 'center' });
    if (round.name) doc.fontSize(14).text(`Runda: ${round.name}`, { align: 'center' });
    doc.fontSize(12).text(`Datum: ${formattedDate}`, { align: 'center' });
    doc.moveDown();

    let currentRoom = '', currentGroup = '';

    PDFDocument.prototype.addPageIfNeeded = function() {
      if (this.y > this.page.height - 100) {
        this.addPage();
      }
    };

    const writeChecks = (checkList, useColor = true) => {
      checkList.forEach(item => {
        if (item.room !== currentRoom) {
          currentRoom = item.room;
          doc.addPageIfNeeded();
          doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('black')
            .text(`\n${stripEmojis(currentRoom)}`, { underline: true });
          currentGroup = '';
        }

        if (item.groupName !== currentGroup) {
          currentGroup = item.groupName;
          doc.font('Helvetica-Bold')
            .fontSize(14)
            .fillColor('black')
            .text(`\n  ${stripEmojis(currentGroup)}`);
        }

        doc.font('Helvetica').fontSize(12);
        if (useColor) {
          const isOk = item.status === 'ok';
          const statusText = isOk ? 'Godkänd' : 'Ej godkänd';
          doc.fillColor(isOk ? 'green' : 'red')
            .text(`    - ${stripEmojis(item.checkpoint)}: ${statusText}`);
        } else {
          doc.fillColor('black').text(`    - ${item.checkpoint}: Ej godkänd`);
        }

        if (item.reason) doc.fillColor('black').text(`      Kommentar: ${item.reason}`);
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
      });
    };

    writeChecks(checks, true);

    const failedChecks = checks.filter(c => c.status !== 'ok');
    if (failedChecks.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(18).fillColor('black').text('Ej godkända punkter', { align: 'center' });
      doc.moveDown();

      currentRoom = '';
      currentGroup = '';
      writeChecks(failedChecks, false);
    }

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
