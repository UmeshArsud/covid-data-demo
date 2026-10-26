// In-memory repository with the same interface as mysql.js. Used by integration tests (no DB needed).
module.exports = function memoryRepo() {
  const users = [], comments = [], sessions = new Map(); let uid = 0, cid = 0;
  const num = (n) => String(n);
  return {
    async stats() { return [{ country: 'India', cases: num(44900000), recovered: num(44400000), deaths: num(531000) }]; },
    async findUserByEmail(e) { return users.find((u) => u.email === e) || null; },
    async getUserById(id) { return users.find((u) => u.id === id) || null; },
    async createUser(u) {
      const r = { id: ++uid, name: u.name, email: u.email, phone: u.phone, password_hash: u.passwordHash, created_at: new Date().toISOString() };
      users.push(r); return r;
    },
    async addComment(userId, body) { comments.push({ id: ++cid, uid: userId, body, at: new Date().toISOString() }); },
    async listComments() {
      return comments.slice().reverse().map((c) => ({ id: c.id, uid: c.uid, by: users.find((u) => u.id === c.uid).name, t: c.body, at: c.at }));
    },
    async listUserComments(userId) { return comments.filter((c) => c.uid === userId).reverse().map((c) => ({ id: c.id, t: c.body, at: c.at })); },
    async countUserComments(userId) { return comments.filter((c) => c.uid === userId).length; },
    async deleteComment(id, userId) {
      const i = comments.findIndex((c) => c.id === id && c.uid === userId);
      if (i < 0) return 0; comments.splice(i, 1); return 1;
    },
    async counts() { return { members: users.length, comments: comments.length }; },
    async getSession(sid) { const s = sessions.get(sid); return s && s.exp > Date.now() ? s.data : null; },
    async setSession(sid, data, exp) { sessions.set(sid, { data, exp }); },
    async deleteSession(sid) { sessions.delete(sid); },
    _users: users,
  };
};
