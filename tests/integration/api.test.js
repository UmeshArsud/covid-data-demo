process.env.BCRYPT_ROUNDS = '4';
const request = require('supertest');
const createApp = require('../../src/app');
const memoryRepo = require('../../src/repo/memory');
const good = { name: 'Test User', email: 'test@example.com', phone: '9876543210', password: 'Covid@2026', confirm: 'Covid@2026' };
let app, repo;
beforeEach(() => { repo = memoryRepo(); app = createApp(repo); });
const loggedIn = async () => {
  const a = request.agent(app);
  await a.post('/api/register').send(good);
  await a.post('/api/login').send({ email: good.email, password: good.password });
  return a;
};

test('IT-01 GET /api/stats returns the statistics list', async () => {
  const res = await request(app).get('/api/stats');
  expect(res.status).toBe(200); expect(Array.isArray(res.body)).toBe(true);
});
test('IT-02 register valid user returns 201 and stores a hashed password', async () => {
  const res = await request(app).post('/api/register').send(good);
  expect(res.status).toBe(201);
  expect(repo._users[0].password_hash).not.toBe(good.password);
  expect(repo._users[0].password_hash).toMatch(/^\$2[aby]\$/);
});
test('IT-03 duplicate email (any letter case) returns 409', async () => {
  await request(app).post('/api/register').send(good);
  const res = await request(app).post('/api/register').send({ ...good, email: 'TEST@Example.com' });
  expect(res.status).toBe(409);
});
test.each([
  ['IT-04', 'name', 'R1'], ['IT-05', 'email', 'bad-email'], ['IT-06', 'phone', '12345'], ['IT-07', 'password', 'weak'],
])('%s invalid %s returns 422 with field message', async (id, field, bad) => {
  const body = { ...good, [field]: bad }; if (field === 'password') body.confirm = bad;
  const res = await request(app).post('/api/register').send(body);
  expect(res.status).toBe(422); expect(res.body.fields[field]).toBeDefined();
});
test('IT-08 password and confirm mismatch returns 422', async () => {
  const res = await request(app).post('/api/register').send({ ...good, confirm: 'Different@1' });
  expect(res.status).toBe(422); expect(res.body.fields.confirm).toBeDefined();
});
test('IT-09 login with unknown email returns 401', async () => {
  expect((await request(app).post('/api/login').send({ email: 'no@one.com', password: 'Covid@2026' })).status).toBe(401);
});
test('IT-10 login with wrong password returns 401', async () => {
  await request(app).post('/api/register').send(good);
  expect((await request(app).post('/api/login').send({ email: good.email, password: 'Wrong@1234' })).status).toBe(401);
});
test('IT-11 valid login returns 200 and never leaks password data', async () => {
  await request(app).post('/api/register').send(good);
  const res = await request(app).post('/api/login').send({ email: good.email, password: good.password });
  expect(res.status).toBe(200); expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);
});
test('IT-12 session: /me is null before login and shows name after login', async () => {
  const a = request.agent(app);
  expect((await a.get('/api/me')).body.user).toBeNull();
  await a.post('/api/register').send(good);
  await a.post('/api/login').send({ email: good.email, password: good.password });
  expect((await a.get('/api/me')).body.user.name).toBe('Test User');
});
test('IT-13 posting a comment without login returns 401', async () => {
  expect((await request(app).post('/api/comments').send({ text: 'Hello there' })).status).toBe(401);
});
test('IT-14 XSS comment is rejected with 422', async () => {
  const a = await loggedIn();
  expect((await a.post('/api/comments').send({ text: '<script>alert(1)</script>' })).status).toBe(422);
});
test('IT-15 valid comment is saved and appears in the list', async () => {
  const a = await loggedIn();
  expect((await a.post('/api/comments').send({ text: 'Stay safe everyone' })).status).toBe(201);
  const list = (await request(app).get('/api/comments')).body;
  expect(list[0]).toMatchObject({ by: 'Test User', t: 'Stay safe everyone' });
});
test('IT-16 SQL-injection text is stored literally as data', async () => {
  const a = await loggedIn(); const t = "x'); DROP TABLE users;--";
  expect((await a.post('/api/comments').send({ text: t })).status).toBe(201);
  expect((await request(app).get('/api/comments')).body[0].t).toBe(t);
});
test('IT-17 logout ends the session', async () => {
  const a = await loggedIn();
  await a.post('/api/logout');
  expect((await a.get('/api/me')).body.user).toBeNull();
  expect((await a.post('/api/comments').send({ text: 'After logout' })).status).toBe(401);
});
test('IT-18 malformed JSON returns 400', async () => {
  const res = await request(app).post('/api/register').set('Content-Type', 'application/json').send('{bad json');
  expect(res.status).toBe(400);
});
test('IT-19 unknown API endpoint returns 404', async () => {
  expect((await request(app).get('/api/nothing')).status).toBe(404);
});
test('IT-20 oversized body (>10 KB) is rejected with 413', async () => {
  const res = await request(app).post('/api/register').send({ ...good, name: 'a'.repeat(20000) });
  expect(res.status).toBe(413);
});

// ---- Session persistence, profile, comment history ----
const second = { ...good, name: 'Second User', email: 'second@example.com' };
const asSecond = async () => {
  const a = request.agent(app);
  await a.post('/api/register').send(second);
  await a.post('/api/login').send({ email: second.email, password: second.password });
  return a;
};
test('IT-21 login survives a server restart (DB-backed session)', async () => {
  await request(app).post('/api/register').send(good);
  const login = await request(app).post('/api/login').send({ email: good.email, password: good.password });
  const restarted = createApp(repo);
  const res = await request(restarted).get('/api/me').set('Cookie', login.headers['set-cookie']);
  expect(res.body.user.name).toBe('Test User');
});
test('IT-22 login returns profile with email and zero comment count', async () => {
  await request(app).post('/api/register').send(good);
  const res = await request(app).post('/api/login').send({ email: good.email, password: good.password });
  expect(res.body.user).toMatchObject({ name: 'Test User', email: good.email, commentCount: 0 });
});
test('IT-23 comment count in /me increases with every post', async () => {
  const a = await loggedIn();
  await a.post('/api/comments').send({ text: 'First comment' });
  await a.post('/api/comments').send({ text: 'Second comment' });
  expect((await a.get('/api/me')).body.user.commentCount).toBe(2);
});
test('IT-24 /my/comments returns only own comments, newest first', async () => {
  const a = await loggedIn(); const b = await asSecond();
  await a.post('/api/comments').send({ text: 'Mine one' });
  await b.post('/api/comments').send({ text: 'Not mine' });
  await a.post('/api/comments').send({ text: 'Mine two' });
  const list = (await a.get('/api/my/comments')).body;
  expect(list.map((c) => c.t)).toEqual(['Mine two', 'Mine one']);
});
test('IT-25 /my/comments without login returns 401', async () => {
  expect((await request(app).get('/api/my/comments')).status).toBe(401);
});
test('IT-26 deleting own comment returns 200 and lowers the count', async () => {
  const a = await loggedIn();
  await a.post('/api/comments').send({ text: 'Delete me' });
  const id = (await a.get('/api/my/comments')).body[0].id;
  expect((await a.delete('/api/comments/' + id)).status).toBe(200);
  expect((await a.get('/api/me')).body.user.commentCount).toBe(0);
});
test("IT-27 deleting another user's comment returns 404 and keeps it", async () => {
  const a = await loggedIn(); const b = await asSecond();
  await a.post('/api/comments').send({ text: 'Owner only' });
  const id = (await a.get('/api/my/comments')).body[0].id;
  expect((await b.delete('/api/comments/' + id)).status).toBe(404);
  expect((await request(app).get('/api/comments')).body).toHaveLength(1);
});
test('IT-28 deleting a comment without login returns 401', async () => {
  expect((await request(app).delete('/api/comments/1')).status).toBe(401);
});
test('IT-29 /overview returns member and comment totals', async () => {
  const a = await loggedIn(); await a.post('/api/comments').send({ text: 'Count me' });
  expect((await request(app).get('/api/overview')).body).toEqual({ members: 1, comments: 1 });
});
test('IT-30 comment list exposes id and author id for ownership checks', async () => {
  const a = await loggedIn(); await a.post('/api/comments').send({ text: 'Ownership' });
  const c = (await request(app).get('/api/comments')).body[0];
  expect(c.id).toBeDefined(); expect(c.uid).toBe(1);
});
