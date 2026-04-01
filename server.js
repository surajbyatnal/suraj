// server.js – CampusHub Backend
const express = require('express');
const cors    = require('cors');

const authRouter        = require('./routes/auth');
const eventsRouter      = require('./routes/events');
const clubsRouter       = require('./routes/clubs');
const usersRouter       = require('./routes/users');
const leaderboardRouter = require('./routes/leaderboard');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',   // restrict to your frontend URL in prod
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/events',      eventsRouter);
app.use('/api/clubs',       clubsRouter);
app.use('/api/users',       usersRouter);
app.use('/api/leaderboard', leaderboardRouter);

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 FALLBACK ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ── ERROR HANDLER ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🎓 CampusHub API running on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
