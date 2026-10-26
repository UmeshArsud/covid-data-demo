// express-session store that keeps sessions in the repository (MySQL `sessions` table) so logins survive restarts.
const session = require('express-session');
class RepoStore extends session.Store {
  constructor(repo) { super(); this.repo = repo; }
  get(sid, cb) { this.repo.getSession(sid).then((r) => cb(null, r ? JSON.parse(r) : null), cb); }
  set(sid, sess, cb) {
    const exp = sess.cookie && sess.cookie.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 864e5;
    this.repo.setSession(sid, JSON.stringify(sess), exp).then(() => cb && cb(), (e) => cb && cb(e));
  }
  destroy(sid, cb) { this.repo.deleteSession(sid).then(() => cb && cb(), (e) => cb && cb(e)); }
  touch(sid, sess, cb) { this.set(sid, sess, cb); }
}
module.exports = RepoStore;
