# CovidWatch – STQA Mini Project
Software Testing and Quality Assurance mini project: a COVID-19 information portal (registration, login, comments, statistics) with a full test suite, test plan, bug taxonomy and test report.

**Stack:** Node.js, Express, MySQL, HTML/CSS/JavaScript · **Testing:** Jest, Supertest

## Project structure
```
covidwatch-stqa/
├── database/schema.sql        tables (users, comments, covid_stats, sessions) + data
├── scripts/seed.js            demo user and sample comments (test data)
├── scripts/report.js          builds docs/TEST_REPORT.md from Jest results
├── src/app.js                 Express app (routes, sessions, validation)
├── src/sessionStore.js        keeps login sessions in MySQL (stay logged in)
├── src/server.js              starts the server with MySQL
├── src/validators.js          regex validation rules
├── src/repo/mysql.js          MySQL data access
├── src/repo/memory.js         in-memory data access (used by tests)
├── public/                    index.html, css/style.css, js/app.js
├── tests/unit/                white-box tests (41)
├── tests/integration/         black-box API tests (30)
└── docs/                      TEST_PLAN, TEST_CASES, BUG_TAXONOMY, TEST_REPORT
```

## Features
- Facebook-style layout: top bar, left menu, community feed, right sidebar (dark mode supported)
- Register and login; header shows your name, avatar and comment count; Log in/Register buttons hide after login
- Login stays active for 7 days (sessions stored in MySQL, survive refresh, browser close and server restart)
- Community feed: post comments (max 200 characters), search, delete your own comments
- My activity: total comments, last activity, member since, full comment history stored in the database
- COVID statistics dashboard: totals, outcome donut chart, bar chart, searchable and sortable table
- Regex Test lab with 24 live test cases

## Run the application
1. Create the database: run `database/schema.sql` in MySQL Workbench (File > Open SQL Script > lightning bolt).
   Upgrading from the earlier version? Only the new `sessions` table is needed (last statement in schema.sql).
2. Install packages: `npm install`
3. Copy `.env.example` to `.env` and put your MySQL password in `DB_PASSWORD`.
4. Add test data: `npm run seed` (login: `demo@covidwatch.test` / `Demo@1234`)
5. Start: `npm start` and open http://localhost:3000

## Run the tests
| Command | What it does |
|---|---|
| `npm test` | all 71 tests with coverage |
| `npm run test:unit` / `npm run test:integration` | one level |
| `npm run report` | runs tests and regenerates `docs/TEST_REPORT.md` |

The Test lab tab in the web page also runs 24 regex cases live in the browser.

## Security features (viva points)
bcrypt password hashing, parameterised SQL (no SQL injection), HTML-escaped output (no XSS), server-side validation repeating client rules, session regeneration on login, 10 KB request limit, httpOnly session cookie.

## Troubleshooting
- `ER_ACCESS_DENIED_ERROR`: wrong password in `.env`.
- `Unknown database`: run step 1 again.
- Port busy: change `PORT` in `.env`.
