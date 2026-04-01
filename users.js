// routes/users.js
const express = require('express');
const { users, activityFeed, notifications, events, clubs, leaderboard } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper: strip password from user object
const safe = (u) => { const { password, ...rest } = u; return rest; };

// ── GET /api/users/me ─────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, data: safe(user) });
});

// ── PUT /api/users/me ─────────────────────────────────────────
router.put('/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const editable = ['name', 'department', 'year'];
  editable.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });

  return res.json({ success: true, data: safe(user) });
});

// ── GET /api/users/me/activity ────────────────────────────────
router.get('/me/activity', authenticate, (req, res) => {
  const feed = activityFeed.filter(a => a.userId === req.user.id);
  return res.json({ success: true, data: feed });
});

// ── GET /api/users/me/notifications ──────────────────────────
router.get('/me/notifications', authenticate, (req, res) => {
  const notifs = notifications.filter(n => n.userId === req.user.id);
  return res.json({ success: true, data: notifs });
});

// ── POST /api/users/me/notifications/:id/read ────────────────
router.post('/me/notifications/:id/read', authenticate, (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
  notif.unread = false;
  return res.json({ success: true, data: notif });
});

// ── POST /api/users/me/notifications/read-all ────────────────
router.post('/me/notifications/read-all', authenticate, (req, res) => {
  notifications.filter(n => n.userId === req.user.id).forEach(n => { n.unread = false; });
  return res.json({ success: true, message: 'All notifications marked as read.' });
});

// ── GET /api/users/me/registered-events ──────────────────────
router.get('/me/registered-events', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const data = events.filter(e => user.registeredEvents.includes(e.id));
  return res.json({ success: true, data });
});

// ── GET /api/users/me/joined-clubs ────────────────────────────
router.get('/me/joined-clubs', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const data = clubs.filter(c => user.joinedClubs.includes(c.id));
  return res.json({ success: true, data });
});

// ── GET /api/users/me/dashboard ───────────────────────────────
// Aggregated data for the home page dashboard cards
router.get('/me/dashboard', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return res.json({
    success: true,
    data: {
      eventsThisWeek: events.length,           // replace with real date filter in production
      myPoints: user.points,
      clubsJoined: user.joinedClubs.length,
      eventsAttended: user.eventsAttended,
    },
  });
});

module.exports = router;
