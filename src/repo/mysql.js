const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'covidwatch',
  waitForConnections: true, connectionLimit: 10,
});
const q = async (sql, p = []) => (await pool.execute(sql, p))[0];
module.exports = {
  pool,
  stats: () => q('SELECT country,cases,recovered,deaths FROM covid_stats ORDER BY cases DESC'),
  findUserByEmail: async (e) => (await q('SELECT * FROM users WHERE email=?', [e]))[0] || null,
  createUser: async (u) => {
    const r = await q('INSERT INTO users(name,email,phone,password_hash) VALUES(?,?,?,?)',
      [u.name, u.email, u.phone, u.passwordHash]);
    return { id: r.insertId, ...u };
  },
  addComment: (uid, body) => q('INSERT INTO comments(user_id,body) VALUES(?,?)', [uid, body]),
  listComments: () => q('SELECT c.id, c.user_id AS uid, u.name AS `by`, c.body AS t, c.created_at AS at FROM comments c JOIN users u ON u.id=c.user_id ORDER BY c.id DESC LIMIT 200'),
  getUserById: async (id) => (await q('SELECT id,name,email,created_at FROM users WHERE id=?', [id]))[0] || null,
  listUserComments: (id) => q('SELECT id, body AS t, created_at AS at FROM comments WHERE user_id=? ORDER BY id DESC', [id]),
  countUserComments: async (id) => Number((await q('SELECT COUNT(*) AS n FROM comments WHERE user_id=?', [id]))[0].n),
  deleteComment: async (id, uid) => (await q('DELETE FROM comments WHERE id=? AND user_id=?', [id, uid])).affectedRows,
  counts: async () => ({ members: Number((await q('SELECT COUNT(*) AS n FROM users'))[0].n), comments: Number((await q('SELECT COUNT(*) AS n FROM comments'))[0].n) }),
  getSession: async (sid) => ((await q('SELECT data FROM sessions WHERE sid=? AND expires>?', [sid, Date.now()]))[0] || {}).data || null,
  setSession: (sid, data, exp) => q('INSERT INTO sessions(sid,data,expires) VALUES(?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data), expires=VALUES(expires)', [sid, data, exp]),
  deleteSession: (sid) => q('DELETE FROM sessions WHERE sid=?', [sid]),
};
