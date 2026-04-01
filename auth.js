// routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { users, uuidv4 } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/register ──────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('usn').trim().notEmpty().withMessage('USN is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('year').isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { name, email, password, usn, department, year } = req.body;

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    if (users.find(u => u.usn === usn)) {
      return res.status(409).json({ success: false, message: 'USN already registered.' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const newUser = {
      id: uuidv4(),
      name, email,
      password: hash,
      usn, department,
      year: Number(year),
      points: 0,
      eventsAttended: 0,
      initials,
      badges: [],
      registeredEvents: [],
      joinedClubs: [],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({ success: true, token, user: safeUser });
  }
);

// ── POST /api/auth/login ─────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    return res.json({ success: true, token, user: safeUser });
  }
);

module.exports = router;
