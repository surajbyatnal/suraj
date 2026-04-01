// routes/events.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { events, users, activityFeed, notifications, uuidv4 } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/events ──────────────────────────────────────────
// Query params: category, q (search), page, limit
router.get('/', (req, res) => {
  const { category, q, page = 1, limit = 20 } = req.query;
  let result = [...events];

  if (category && category !== 'all') {
    result = result.filter(e => e.category === category);
  }
  if (q) {
    const query = q.toLowerCase();
    result = result.filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query) ||
      e.organizer.toLowerCase().includes(query) ||
      e.venue.toLowerCase().includes(query)
    );
  }

  const total = result.length;
  const start = (Number(page) - 1) * Number(limit);
  result = result.slice(start, start + Number(limit));

  return res.json({ success: true, total, page: Number(page), data: result });
});

// ── GET /api/events/:id ──────────────────────────────────────
router.get('/:id', (req, res) => {
  const event = events.find(e => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  return res.json({ success: true, data: event });
});

// ── POST /api/events ─────────────────────────────────────────
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').isIn(['tech', 'cultural', 'sports', 'workshop', 'social', 'academic']).withMessage('Invalid category'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('max').isInt({ min: 1 }).withMessage('Max attendees must be a positive number'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const user = users.find(u => u.id === req.user.id);
    const { title, category, emoji = '📅', date, time, venue, max, description } = req.body;

    const newEvent = {
      id: events.length + 1,
      title, category, emoji, date, time, venue,
      organizer: user ? user.name : 'Unknown',
      orgInitials: user ? user.initials : 'UN',
      orgColor: '#6c63ff',
      registered: 0,
      max: Number(max),
      description,
      color: 'rgba(108,99,255,0.15)',
      textColor: 'var(--accent)',
      calDay: new Date(date).getDate() || 1,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
    };

    events.push(newEvent);

    // Log activity
    if (user) {
      activityFeed.unshift({
        id: uuidv4(), userId: user.id, icon: '💡', bg: 'rgba(247,151,30,0.15)',
        text: `Created event: ${title}`, time: 'Just now', createdAt: new Date().toISOString(),
      });
    }

    return res.status(201).json({ success: true, data: newEvent });
  }
);

// ── PUT /api/events/:id ──────────────────────────────────────
router.put('/:id', authenticate, (req, res) => {
  const idx = events.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Event not found.' });

  const event = events[idx];
  if (event.createdBy && event.createdBy !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorised to edit this event.' });
  }

  const allowed = ['title', 'category', 'emoji', 'date', 'time', 'venue', 'max', 'description'];
  allowed.forEach(k => { if (req.body[k] !== undefined) event[k] = req.body[k]; });
  events[idx] = event;

  return res.json({ success: true, data: event });
});

// ── DELETE /api/events/:id ───────────────────────────────────
router.delete('/:id', authenticate, (req, res) => {
  const idx = events.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Event not found.' });

  const event = events[idx];
  if (event.createdBy && event.createdBy !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorised to delete this event.' });
  }

  events.splice(idx, 1);
  return res.json({ success: true, message: 'Event deleted.' });
});

// ── POST /api/events/:id/register ────────────────────────────
router.post('/:id/register', authenticate, (req, res) => {
  const event = events.find(e => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  if (user.registeredEvents.includes(event.id)) {
    return res.status(409).json({ success: false, message: 'Already registered for this event.' });
  }
  if (event.registered >= event.max) {
    return res.status(400).json({ success: false, message: 'Event is fully booked.' });
  }

  user.registeredEvents.push(event.id);
  event.registered += 1;

  // Award points
  user.points += 50;
  user.eventsAttended += 1;

  // Activity
  activityFeed.unshift({
    id: uuidv4(), userId: user.id, icon: '✅', bg: 'rgba(67,233,123,0.15)',
    text: `You registered for ${event.title}`, time: 'Just now', createdAt: new Date().toISOString(),
  });

  // Notification
  notifications.unshift({
    id: uuidv4(), userId: user.id, icon: '✅', bg: 'rgba(67,233,123,0.15)',
    title: `Registered for ${event.title}`,
    description: `Your spot is confirmed. See you on ${event.date} at ${event.venue}.`,
    time: 'Just now', unread: true, createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: 'Registered successfully.', points: user.points });
});

// ── DELETE /api/events/:id/register ──────────────────────────
router.delete('/:id/register', authenticate, (req, res) => {
  const event = events.find(e => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const idx = user.registeredEvents.indexOf(event.id);
  if (idx === -1) return res.status(400).json({ success: false, message: 'Not registered for this event.' });

  user.registeredEvents.splice(idx, 1);
  event.registered = Math.max(0, event.registered - 1);
  user.points = Math.max(0, user.points - 50);

  activityFeed.unshift({
    id: uuidv4(), userId: user.id, icon: '❌', bg: 'rgba(255,101,132,0.15)',
    text: `Cancelled registration for ${event.title}`, time: 'Just now', createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: 'Registration cancelled.' });
});

module.exports = router;
