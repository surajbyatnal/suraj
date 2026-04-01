# 🎓 CampusHub — Backend API

REST API for the **CampusHub** Unified Event & Extracurricular Platform.  
Built with **Node.js + Express**. Uses an in-memory data store (easy swap to MongoDB/PostgreSQL).

---

## Quick Start

```bash
# 1. Install dependencies
cd campushub-backend
npm install

# 2. Start dev server (auto-reload)
npm run dev

# 3. Or start production server
npm start
```

Server runs on **http://localhost:4000**

---

## Project Structure

```
campushub-backend/
├── src/
│   ├── server.js               # App entry point
│   ├── config/
│   │   └── db.js               # In-memory data store (seed data)
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   └── routes/
│       ├── auth.js             # POST /register, /login
│       ├── events.js           # Full CRUD + register/unregister
│       ├── clubs.js            # List + join/leave
│       ├── users.js            # Profile, activity, notifications
│       └── leaderboard.js      # Rankings + platform stats
├── package.json
└── README.md
```

---

## Environment Variables

| Variable        | Default                        | Description                    |
|-----------------|--------------------------------|--------------------------------|
| `PORT`          | `4000`                         | Server port                    |
| `JWT_SECRET`    | `campushub_dev_secret_...`     | **Change this in production!** |
| `CLIENT_ORIGIN` | `*`                            | Allowed CORS origin            |

---

## API Reference

All responses follow: `{ success: boolean, data?: any, message?: string }`

### 🔐 Auth

| Method | Endpoint              | Body                                                  | Description    |
|--------|-----------------------|-------------------------------------------------------|----------------|
| POST   | `/api/auth/register`  | `name, email, password, usn, department, year`        | Register user  |
| POST   | `/api/auth/login`     | `email, password`                                     | Login & get JWT|

**Login response:**
```json
{ "success": true, "token": "<jwt>", "user": { "id": "...", "name": "...", ... } }
```

Pass the token in subsequent requests:
```
Authorization: Bearer <token>
```

---

### 📅 Events

| Method | Endpoint                        | Auth? | Description                    |
|--------|---------------------------------|-------|--------------------------------|
| GET    | `/api/events`                   | No    | List events (filter/search)    |
| GET    | `/api/events/:id`               | No    | Get single event               |
| POST   | `/api/events`                   | ✅    | Create new event               |
| PUT    | `/api/events/:id`               | ✅    | Update event (creator only)    |
| DELETE | `/api/events/:id`               | ✅    | Delete event (creator only)    |
| POST   | `/api/events/:id/register`      | ✅    | Register for event (+50 pts)   |
| DELETE | `/api/events/:id/register`      | ✅    | Cancel registration            |

**GET /api/events query params:**
- `category` — `tech | cultural | sports | workshop | social | academic`
- `q` — search string
- `page`, `limit` — pagination

**POST /api/events body:**
```json
{
  "title": "Spring Hackathon",
  "category": "tech",
  "emoji": "🚀",
  "date": "Apr 20",
  "time": "9:00 AM",
  "venue": "Innovation Lab",
  "max": 100,
  "description": "Build something amazing in 24 hours."
}
```

---

### 🏛️ Clubs

| Method | Endpoint                | Auth? | Description                    |
|--------|-------------------------|-------|--------------------------------|
| GET    | `/api/clubs`            | No    | List clubs (filter/search)     |
| GET    | `/api/clubs/:id`        | No    | Get single club                |
| POST   | `/api/clubs/:id/join`   | ✅    | Join club (+30 pts)            |
| DELETE | `/api/clubs/:id/join`   | ✅    | Leave club                     |

**GET /api/clubs query params:**
- `tab` — `all | new | popular`
- `q` — search string

---

### 👤 User / Profile

| Method | Endpoint                                  | Auth? | Description                    |
|--------|-------------------------------------------|-------|--------------------------------|
| GET    | `/api/users/me`                           | ✅    | Get own profile                |
| PUT    | `/api/users/me`                           | ✅    | Update profile (name/dept/year)|
| GET    | `/api/users/me/dashboard`                 | ✅    | Dashboard summary stats        |
| GET    | `/api/users/me/activity`                  | ✅    | Activity feed                  |
| GET    | `/api/users/me/notifications`             | ✅    | All notifications              |
| POST   | `/api/users/me/notifications/:id/read`    | ✅    | Mark notification as read      |
| POST   | `/api/users/me/notifications/read-all`    | ✅    | Mark all notifications as read |
| GET    | `/api/users/me/registered-events`         | ✅    | Events the user registered for |
| GET    | `/api/users/me/joined-clubs`              | ✅    | Clubs the user joined          |

---

### 🏆 Leaderboard & Stats

| Method | Endpoint                  | Auth? | Description                       |
|--------|---------------------------|-------|-----------------------------------|
| GET    | `/api/leaderboard`        | No    | Rankings sorted by points         |
| GET    | `/api/leaderboard/stats`  | No    | Platform-wide stats (hero counters)|

---

### ❤️ Health Check

```
GET /api/health
→ { "status": "ok", "timestamp": "..." }
```

---

## Connecting the Frontend

In `campus-hub.html`, replace the hardcoded `events`, `clubs`, etc. arrays with
`fetch()` calls to this API. Example:

```js
const BASE = 'http://localhost:4000/api';

// Load events
const { data } = await fetch(`${BASE}/events?category=tech`).then(r => r.json());

// Register for an event (requires token)
await fetch(`${BASE}/events/3/register`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## Upgrading to a Real Database

Replace the arrays in `src/config/db.js` with:

- **MongoDB** — use Mongoose models
- **PostgreSQL** — use Prisma or pg
- **SQLite** — use better-sqlite3 (great for hackathons!)

The route handlers are already written to be async-friendly; just swap
the in-memory reads/writes for DB queries.
