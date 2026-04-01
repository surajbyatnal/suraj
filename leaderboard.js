// routes/leaderboard.js
const express = require('express');
const { leaderboard, platformStats } = require('../config/db');

const router = express.Router();

// ── GET /api/leaderboard ──────────────────────────────────────
router.get('/', (req, res) => {
  const sorted = [...leaderboard].sort((a, b) => b.points - a.points)
    .map((u, i) => ({ ...u, rank: i + 1 }));
  return res.json({ success: true, data: sorted });
});

// ── GET /api/leaderboard/stats ────────────────────────────────
router.get('/stats', (req, res) => {
  return res.json({ success: true, data: platformStats });
});

module.exports = router;
