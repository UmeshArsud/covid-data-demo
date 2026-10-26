const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { valid } = require('./validators');
const RepoStore = require('./sessionStore');
const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

module.exports = function createApp(repo) {
  const app = express();
  app.use(express.json({ limit: '10kb' }));
  app.use(session({
    store: new RepoStore(repo), secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false, saveUninitialized: false, rolling: true,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 },
  }));
  app.use(express.static(path.join(__dirname, '../public')));

  const api = express.Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  const auth = (req, res, next) => (req.session.uid ? next() : res.status(401).json({ error: 'Please log in first.' }));
  const profile = async (id) => {
    const u = await repo.getUserById(id);
    return u ? { id: u.id, name: u.name, email: u.email, since: u.created_at, commentCount: Number(await repo.countUserComments(id)) } : null;
  };

  api.get('/stats', wrap(async (req, res) => res.json(await repo.stats())));
  api.get('/overview', wrap(async (req, res) => res.json(await repo.counts())));

  api.post('/register', wrap(async (req, res) => {
    const b = req.body || {}, f = {};
    if (!valid('name', b.name)) f.name = 'Enter 3–30 letters; spaces, dots and hyphens are allowed.';
    if (!valid('email', b.email)) f.email = 'Enter a valid email.';
    if (!valid('phone', b.phone)) f.phone = 'Enter 10 digits starting with 6–9.';
    if (!valid('pass', b.password)) f.password = 'Use 8–32 characters with upper, lower, digit and symbol.';
    else if (b.password !== b.confirm) f.confirm = 'Passwords do not match.';
    if (Object.keys(f).length) return res.status(422).json({ error: 'Validation failed: ' + Object.values(f).join(' '), fields: f });
    const email = b.email.toLowerCase();
    if (await repo.findUserByEmail(email)) return res.status(409).json({ error: 'This email is already registered. Log in instead.' });
    await repo.createUser({ name: b.name.trim(), email, phone: b.phone, passwordHash: await bcrypt.hash(b.password, ROUNDS) });
    res.status(201).json({ message: 'Account created. You can log in now.' });
  }));

  api.post('/login', wrap(async (req, res) => {
    const b = req.body || {};
    const u = typeof b.email === 'string' ? await repo.findUserByEmail(b.email.toLowerCase()) : null;
    const ok = u && typeof b.password === 'string' && (await bcrypt.compare(b.password, u.password_hash));
    if (!ok) return res.status(401).json({ error: 'Email or password is incorrect.' });
    await new Promise((r) => req.session.regenerate(r));
    req.session.uid = u.id; req.session.name = u.name;
    res.json({ message: `Welcome back, ${u.name}!`, user: await profile(u.id) });
  }));

  api.post('/logout', (req, res) => req.session.destroy(() => res.json({ message: 'Logged out.' })));
  api.get('/me', wrap(async (req, res) => res.json({ user: req.session.uid ? await profile(req.session.uid) : null })));

  api.get('/comments', wrap(async (req, res) => res.json(await repo.listComments())));
  api.get('/my/comments', auth, wrap(async (req, res) => res.json(await repo.listUserComments(req.session.uid))));

  api.post('/comments', auth, wrap(async (req, res) => {
    const t = (req.body || {}).text;
    if (!valid('comment', t)) return res.status(422).json({ error: 'Write 3–200 characters without < or >.' });
    await repo.addComment(req.session.uid, t.trim());
    res.status(201).json({ message: 'Comment posted.' });
  }));

  api.delete('/comments/:id', auth, wrap(async (req, res) => {
    const id = Number(req.params.id);
    const n = Number.isInteger(id) ? await repo.deleteComment(id, req.session.uid) : 0;
    if (!n) return res.status(404).json({ error: 'Comment not found.' });
    res.json({ message: 'Comment deleted.' });
  }));

  api.use((req, res) => res.status(404).json({ error: 'Unknown endpoint' }));
  app.use('/api', api);
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
    console.error(err); res.status(500).json({ error: 'Server error' });
  });
  return app;
};
