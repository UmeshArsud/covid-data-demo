// Adds demo/test data: user demo@covidwatch.test / Demo@1234 plus sample comments.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const repo = require('../src/repo/mysql');
(async () => {
  const email = 'demo@covidwatch.test';
  let u = await repo.findUserByEmail(email);
  if (!u) u = await repo.createUser({ name: 'Demo User', email, phone: '9876543210', passwordHash: await bcrypt.hash('Demo@1234', 10) });
  if ((await repo.listComments()).length === 0)
    for (const t of ['Wash your hands for 20 seconds.', 'Ventilate rooms and wear a mask in crowds.', 'Check WHO for official updates.'])
      await repo.addComment(u.id, t);
  console.log('Seed complete. Login: demo@covidwatch.test / Demo@1234');
  await repo.pool.end();
})().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
