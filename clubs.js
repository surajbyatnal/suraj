// routes/clubs.js
const express = require('express');
const { clubs, users, activityFeed, uuidv4 } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/clubs ────────────────────────────────────────────
// Query params: tab (all|new|popular), q
router.get('/', (req, res) => {
  const { tab = 'all', q } = req.query;
  let result = [...clubs];

  if (tab === 'new')     result = result.filter(c => c.isNew);
  if (tab === 'popular') result = [...result].sort((a, b) => b.members - a.members);

  if (q) {
    const query = q.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  }

  return res.json({ success: true, total: result.length, data: result });
});

// ── GET /api/clubs/:id ────────────────────────────────────────
router.get('/:id', (req, res) => {
  const club = clubs.find(c => c.id === Number(req.params.id));
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
  return res.json({ success: true, data: club });
});

// ── POST /api/clubs/:id/join ──────────────────────────────────
router.post('/:id/join', authenticate, (req, res) => {
  const club = clubs.find(c => c.id === Number(req.params.id));
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });

  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  if (user.joinedClubs.includes(club.id)) {
    return res.status(409).json({ success: false, message: 'Already a member of this club.' });
  }

  user.joinedClubs.push(club.id);
  club.members += 1;
  user.points += 30;

  activityFeed.unshift({
    id: uuidv4(), userId: user.id, icon: '👥', bg: 'rgba(108,99,255,0.15)',
    text: `Joined ${club.name}`, time: 'Just now', createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: `Welcome to ${club.name}!`, points: user.points });
});

// ── DELETE /api/clubs/:id/join ────────────────────────────────
router.delete('/:id/join', authenticate, (req, res) => {
  const club = clubs.find(c => c.id === Number(req.params.id));
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });

  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const idx = user.joinedClubs.indexOf(club.id);
  if (idx === -1) return res.status(400).json({ success: false, message: 'Not a member of this club.' });

  user.joinedClubs.splice(idx, 1);
  club.members = Math.max(0, club.members - 1);

  activityFeed.unshift({
    id: uuidv4(), userId: user.id, icon: '👋', bg: 'rgba(255,101,132,0.15)',
    text: `Left ${club.name}`, time: 'Just now', createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: `Left ${club.name}.` });
});

module.exports = router;
