// api.js  — Drop this <script> into campus-hub.html to connect it to the backend
// Usage:  <script src="api.js"></script>
//
// Replace the hardcoded data arrays and toggle functions with these API calls.

const BASE_URL = 'http://localhost:4000/api';

// ── TOKEN MANAGEMENT ──────────────────────────────────────────
const getToken  = () => localStorage.getItem('campushub_token');
const setToken  = (t) => localStorage.setItem('campushub_token', t);
const clearToken = () => localStorage.removeItem('campushub_token');

function authHeaders() {
  const token = getToken();
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
               : { 'Content-Type': 'application/json' };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API error');
  return json;
}

// ══════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════

async function apiLogin(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

async function apiRegister({ name, email, password, usn, department, year }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, usn, department, year }),
  });
  setToken(data.token);
  return data.user;
}

function apiLogout() {
  clearToken();
  location.reload();
}

// ══════════════════════════════════════════════════════════════
//  EVENTS
// ══════════════════════════════════════════════════════════════

async function apiGetEvents({ category = 'all', q = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ category, page, limit });
  if (q) params.set('q', q);
  const data = await apiFetch(`/events?${params}`);
  return data;  // { total, page, data: Event[] }
}

async function apiGetEvent(id) {
  const data = await apiFetch(`/events/${id}`);
  return data.data;
}

async function apiCreateEvent(payload) {
  const data = await apiFetch('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.data;
}

async function apiRegisterForEvent(eventId) {
  return apiFetch(`/events/${eventId}/register`, { method: 'POST' });
}

async function apiUnregisterFromEvent(eventId) {
  return apiFetch(`/events/${eventId}/register`, { method: 'DELETE' });
}

// ══════════════════════════════════════════════════════════════
//  CLUBS
// ══════════════════════════════════════════════════════════════

async function apiGetClubs({ tab = 'all', q = '' } = {}) {
  const params = new URLSearchParams({ tab });
  if (q) params.set('q', q);
  const data = await apiFetch(`/clubs?${params}`);
  return data.data;
}

async function apiJoinClub(clubId) {
  return apiFetch(`/clubs/${clubId}/join`, { method: 'POST' });
}

async function apiLeaveClub(clubId) {
  return apiFetch(`/clubs/${clubId}/join`, { method: 'DELETE' });
}

// ══════════════════════════════════════════════════════════════
//  USER / PROFILE
// ══════════════════════════════════════════════════════════════

async function apiGetProfile() {
  const data = await apiFetch('/users/me');
  return data.data;
}

async function apiUpdateProfile(fields) {
  const data = await apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(fields) });
  return data.data;
}

async function apiGetDashboard() {
  const data = await apiFetch('/users/me/dashboard');
  return data.data;
}

async function apiGetActivity() {
  const data = await apiFetch('/users/me/activity');
  return data.data;
}

async function apiGetNotifications() {
  const data = await apiFetch('/users/me/notifications');
  return data.data;
}

async function apiMarkAllRead() {
  return apiFetch('/users/me/notifications/read-all', { method: 'POST' });
}

async function apiGetRegisteredEvents() {
  const data = await apiFetch('/users/me/registered-events');
  return data.data;
}

async function apiGetJoinedClubs() {
  const data = await apiFetch('/users/me/joined-clubs');
  return data.data;
}

// ══════════════════════════════════════════════════════════════
//  LEADERBOARD & STATS
// ══════════════════════════════════════════════════════════════

async function apiGetLeaderboard() {
  const data = await apiFetch('/leaderboard');
  return data.data;
}

async function apiGetPlatformStats() {
  const data = await apiFetch('/leaderboard/stats');
  return data.data;
}

// ══════════════════════════════════════════════════════════════
//  EXAMPLE: Bootstrap the page from the API (replaces hardcoded data)
// ══════════════════════════════════════════════════════════════

async function bootstrapFromAPI() {
  try {
    // Platform stats → hero counters
    const stats = await apiGetPlatformStats();
    animateCounter(document.getElementById('counter-events'),   stats.eventsThisMonth);
    animateCounter(document.getElementById('counter-clubs'),    stats.activeClubs);
    animateCounter(document.getElementById('counter-students'), stats.studentsEngaged);
    animateCounter(document.getElementById('counter-points'),   stats.pointsAwarded, '+');

    // Events preview on home page
    const { data: eventList } = await apiGetEvents({ limit: 3 });
    const homeContainer = document.getElementById('home-events');
    if (homeContainer) homeContainer.innerHTML = eventList.map(renderEventCard).join('');

  } catch (err) {
    console.warn('API bootstrap failed, using local data:', err.message);
    // Graceful fallback: existing hardcoded renderHomeEvents() will run instead
  }
}

// Call on page load instead of (or after) the existing DOMContentLoaded handler
// document.addEventListener('DOMContentLoaded', bootstrapFromAPI);
