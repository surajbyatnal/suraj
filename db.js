// ═══════════════════════════════════════════════════════════
//  db.js  – In-memory data store (swap for a real DB later)
// ═══════════════════════════════════════════════════════════
const { v4: uuidv4 } = require('uuid');

// ── EVENTS ──────────────────────────────────────────────────
const events = [
  { id: 1, title: 'Web Dev Bootcamp',      category: 'tech',     emoji: '💻', date: 'Apr 8',  time: '10:00 AM', venue: 'Lab 3B',             organizer: 'Code Club',        orgInitials: 'CC', orgColor: '#6c63ff', registered: 45,  max: 60,  description: 'Hands-on HTML/CSS/JS workshop for beginners.',                                                color: 'rgba(108,99,255,0.15)',  textColor: 'var(--accent)',  calDay: 8 },
  { id: 2, title: 'Cultural Night 2025',   category: 'cultural', emoji: '🎭', date: 'Apr 12', time: '6:00 PM',  venue: 'Open Amphitheater',  organizer: 'Art Society',      orgInitials: 'AS', orgColor: '#ff6584', registered: 180, max: 200, description: 'Annual cultural extravaganza with dance, music, and drama.',                                    color: 'rgba(255,101,132,0.15)', textColor: 'var(--accent2)', calDay: 12 },
  { id: 3, title: 'Inter-Dept Football',   category: 'sports',   emoji: '⚽', date: 'Apr 10', time: '4:00 PM',  venue: 'Ground A',           organizer: 'Sports Club',      orgInitials: 'SC', orgColor: '#43e97b', registered: 120, max: 150, description: 'Annual football tournament between departments.',                                               color: 'rgba(67,233,123,0.15)',  textColor: 'var(--accent3)', calDay: 10 },
  { id: 4, title: 'AI/ML Workshop',        category: 'workshop', emoji: '🤖', date: 'Apr 14', time: '9:00 AM',  venue: 'Seminar Hall B',     organizer: 'AI Club',          orgInitials: 'AI', orgColor: '#38f9d7', registered: 88,  max: 100, description: 'Deep dive into machine learning with hands-on Python.',                                         color: 'rgba(56,249,215,0.15)',  textColor: 'var(--accent5)', calDay: 14 },
  { id: 5, title: 'Photography Walk',      category: 'social',   emoji: '📸', date: 'Apr 9',  time: '7:00 AM',  venue: 'Campus Trail',       organizer: 'Photo Society',    orgInitials: 'PS', orgColor: '#f7971e', registered: 28,  max: 40,  description: 'Sunrise campus photography walk. Beginners welcome!',                                          color: 'rgba(247,151,30,0.15)',  textColor: 'var(--accent4)', calDay: 9  },
  { id: 6, title: 'Debate Competition',    category: 'academic', emoji: '🗣️', date: 'Apr 11', time: '2:00 PM',  venue: 'Seminar Hall A',     organizer: 'Debate Club',      orgInitials: 'DC', orgColor: '#a78bfa', registered: 36,  max: 60,  description: 'Parliamentary debate on current affairs. Register in pairs.',                                   color: 'rgba(167,139,250,0.15)', textColor: '#a78bfa',        calDay: 11 },
  { id: 7, title: 'Startup Pitch Day',     category: 'tech',     emoji: '💡', date: 'Apr 16', time: '11:00 AM', venue: 'Innovation Lab',     organizer: 'E-Cell',           orgInitials: 'EC', orgColor: '#6c63ff', registered: 22,  max: 30,  description: 'Present your startup ideas to angel investors.',                                               color: 'rgba(108,99,255,0.15)',  textColor: 'var(--accent)',  calDay: 16 },
  { id: 8, title: 'Dance Workshop',        category: 'cultural', emoji: '💃', date: 'Apr 13', time: '5:00 PM',  venue: 'Dance Studio',       organizer: 'Dance Club',       orgInitials: 'DC', orgColor: '#ff6584', registered: 35,  max: 40,  description: 'Learn contemporary and classical dance forms.',                                                color: 'rgba(255,101,132,0.15)', textColor: 'var(--accent2)', calDay: 13 },
  { id: 9, title: 'Chess Tournament',      category: 'sports',   emoji: '♟️', date: 'Apr 17', time: '10:00 AM', venue: 'Recreation Room',    organizer: 'Chess Club',       orgInitials: 'CC', orgColor: '#43e97b', registered: 24,  max: 32,  description: 'Double elimination chess tournament. All skill levels!',                                       color: 'rgba(67,233,123,0.15)',  textColor: 'var(--accent3)', calDay: 17 },
];

// ── CLUBS ────────────────────────────────────────────────────
const clubs = [
  { id: 1,  name: 'Code Club',             category: 'Technology',     emoji: '💻', bg: 'rgba(108,99,255,0.15)',  color: 'var(--accent)',  members: 234, description: 'Building the next generation of software engineers through hackathons, workshops, and open-source.', isNew: false },
  { id: 2,  name: 'Photography Society',   category: 'Arts & Media',   emoji: '📸', bg: 'rgba(247,151,30,0.15)',  color: 'var(--accent4)', members: 89,  description: 'Capturing campus life one frame at a time. Weekly photo walks and editing workshops.',              isNew: false },
  { id: 3,  name: 'AI Research Club',      category: 'Technology',     emoji: '🤖', bg: 'rgba(56,249,215,0.15)',  color: 'var(--accent5)', members: 156, description: 'Exploring machine learning, computer vision, and natural language processing.',                      isNew: false },
  { id: 4,  name: 'Drama Society',         category: 'Performing Arts', emoji: '🎭', bg: 'rgba(255,101,132,0.15)', color: 'var(--accent2)', members: 72,  description: 'Annual plays, improv sessions, and storytelling workshops for all experience levels.',               isNew: true  },
  { id: 5,  name: 'Entrepreneurship Cell', category: 'Business',       emoji: '💡', bg: 'rgba(108,99,255,0.15)',  color: 'var(--accent)',  members: 198, description: 'Connect with startups, investors, and build your entrepreneurial mindset.',                         isNew: false },
  { id: 6,  name: 'Sports Club',           category: 'Sports',         emoji: '⚽', bg: 'rgba(67,233,123,0.15)',  color: 'var(--accent3)', members: 312, description: 'Representing the college in inter-university sports. Tournaments, coaching, and fitness.',            isNew: false },
  { id: 7,  name: 'Music Society',         category: 'Performing Arts', emoji: '🎵', bg: 'rgba(255,101,132,0.15)', color: 'var(--accent2)', members: 108, description: 'Jam sessions, live performances, and recording workshops for all genres.',                           isNew: false },
  { id: 8,  name: 'Debate Club',           category: 'Academic',       emoji: '🗣️', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa',        members: 64,  description: 'Sharpen your arguments and critical thinking skills through competitive debate.',                    isNew: true  },
  { id: 9,  name: 'Robotics Lab',          category: 'Technology',     emoji: '🤖', bg: 'rgba(56,249,215,0.15)',  color: 'var(--accent5)', members: 90,  description: 'Building bots, drones, and IoT projects. Hardware meets software here.',                           isNew: true  },
  { id: 10, name: 'Environment Club',      category: 'Social',         emoji: '🌿', bg: 'rgba(67,233,123,0.15)',  color: 'var(--accent3)', members: 121, description: 'Sustainability drives, tree plantations, and awareness campaigns on campus.',                        isNew: false },
  { id: 11, name: 'Literary Society',      category: 'Academic',       emoji: '📚', bg: 'rgba(247,151,30,0.15)',  color: 'var(--accent4)', members: 77,  description: 'Book clubs, creative writing, poetry slams, and literary festivals.',                               isNew: false },
  { id: 12, name: 'Design Studio',         category: 'Arts & Media',   emoji: '🎨', bg: 'rgba(255,101,132,0.15)', color: 'var(--accent2)', members: 83,  description: 'UI/UX, graphic design, and branding workshops. Build your portfolio.',                              isNew: true  },
];

// ── USERS ────────────────────────────────────────────────────
// Passwords stored as bcrypt hashes in real app; plain text here for seed clarity
const users = [
  {
    id: 'u1',
    name: 'Aditya Rao',
    email: 'aditya@campushub.edu',
    password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCU.ZjKrEbKkK1yEqKwdJuKmm4X2HkC0dIy', // "password123"
    usn: '1CB21CS010',
    department: 'Computer Science',
    year: 3,
    points: 2840,
    eventsAttended: 23,
    initials: 'AR',
    badges: ['🏆 Top Participant', '✅ Event Organizer', '🚀 Hackathon Pro', '🎨 Creative Lead'],
    registeredEvents: [1, 4],
    joinedClubs: [1, 3, 5, 7],
    createdAt: new Date('2024-07-15').toISOString(),
  },
];

// ── NOTIFICATIONS ────────────────────────────────────────────
const notifications = [
  { id: 'n1', userId: 'u1', icon: '🚀', bg: 'rgba(108,99,255,0.15)', title: 'Hackathon Registration Opens Tomorrow', description: 'Annual Hackathon 2025 registration opens at 10 AM. Set a reminder!', time: '2 hours ago', unread: true,  createdAt: new Date().toISOString() },
  { id: 'n2', userId: 'u1', icon: '✅', bg: 'rgba(67,233,123,0.15)',  title: "You're registered for Web Dev Bootcamp",  description: 'Your spot is confirmed. See you on Apr 8 at Lab 3B.',            time: 'Yesterday',  unread: true,  createdAt: new Date().toISOString() },
  { id: 'n3', userId: 'u1', icon: '🏆', bg: 'rgba(255,215,0,0.15)',   title: 'You earned 150 points!',                  description: 'Attendance at AI/ML Workshop has been verified. Keep going!',   time: '2 days ago', unread: true,  createdAt: new Date().toISOString() },
  { id: 'n4', userId: 'u1', icon: '📣', bg: 'rgba(255,101,132,0.15)', title: 'Code Club meeting tonight',               description: 'Weekly sync at 7 PM, Lab 2A. Topic: Open Source Contributions.', time: '3 days ago', unread: false, createdAt: new Date().toISOString() },
  { id: 'n5', userId: 'u1', icon: '📅', bg: 'rgba(56,249,215,0.15)',  title: 'Cultural Night — 3 days away',            description: "Don't forget! Apr 12 at 6 PM at the Open Amphitheater.",         time: '3 days ago', unread: false, createdAt: new Date().toISOString() },
];

// ── ACTIVITY FEED ────────────────────────────────────────────
const activityFeed = [
  { id: 'a1', userId: 'u1', icon: '✅', bg: 'rgba(67,233,123,0.15)',  text: 'You registered for AI/ML Workshop on Apr 14',          time: 'Today, 10:30 AM',  createdAt: new Date().toISOString() },
  { id: 'a2', userId: 'u1', icon: '🏆', bg: 'rgba(255,215,0,0.15)',   text: 'Earned +120 points for attending Photography Walk',     time: 'Yesterday, 8:45 AM', createdAt: new Date().toISOString() },
  { id: 'a3', userId: 'u1', icon: '👥', bg: 'rgba(108,99,255,0.15)',  text: 'Joined Entrepreneurship Cell club',                    time: 'Apr 2, 3:00 PM',   createdAt: new Date().toISOString() },
  { id: 'a4', userId: 'u1', icon: '📝', bg: 'rgba(56,249,215,0.15)',  text: 'Submitted feedback for Web Dev Bootcamp',              time: 'Apr 1, 5:20 PM',   createdAt: new Date().toISOString() },
  { id: 'a5', userId: 'u1', icon: '🎯', bg: 'rgba(255,101,132,0.15)', text: 'Volunteered for Cultural Night 2025 setup',            time: 'Mar 30, 11:00 AM', createdAt: new Date().toISOString() },
  { id: 'a6', userId: 'u1', icon: '💡', bg: 'rgba(247,151,30,0.15)',  text: 'Created event: Startup Pitch Day',                     time: 'Mar 28, 2:00 PM',  createdAt: new Date().toISOString() },
];

// ── LEADERBOARD ───────────────────────────────────────────────
const leaderboard = [
  { rank: 1, userId: 'lb1', name: 'Priya Sharma', department: 'ECE 3rd Year', points: 4120, color: '#6c63ff', initials: 'PS' },
  { rank: 2, userId: 'lb2', name: 'Rahul Mehta',  department: 'CS 4th Year',  points: 3890, color: '#38f9d7', initials: 'RM' },
  { rank: 3, userId: 'lb3', name: 'Sneha Patil',  department: 'ME 2nd Year',  points: 3540, color: '#ff6584', initials: 'SP' },
  { rank: 4, userId: 'u1',  name: 'Aditya Rao',   department: 'CS 3rd Year',  points: 2840, color: '#43e97b', initials: 'AR' },
  { rank: 5, userId: 'lb5', name: 'Kavya Nair',   department: 'ISE 3rd Year', points: 2710, color: '#f7971e', initials: 'KN' },
  { rank: 6, userId: 'lb6', name: 'Dev Kumar',    department: 'AIML 2nd Year',points: 2400, color: '#a78bfa', initials: 'DK' },
  { rank: 7, userId: 'lb7', name: 'Meera Joshi',  department: 'ECE 4th Year', points: 2210, color: '#6c63ff', initials: 'MJ' },
];

// ── PLATFORM STATS ────────────────────────────────────────────
const platformStats = {
  eventsThisMonth: 48,
  activeClubs: 48,
  studentsEngaged: 2847,
  pointsAwarded: 94200,
};

module.exports = { events, clubs, users, notifications, activityFeed, leaderboard, platformStats, uuidv4 };
