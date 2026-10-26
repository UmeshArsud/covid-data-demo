# Test Plan – CovidWatch (COVID-19 Information Portal)

## 1. Objective
Verify that registration, login, commenting and statistics features work correctly, reject invalid or malicious input, and protect user data.

## 2. System under test
Node.js 22 + Express 4 REST API, MySQL 8 database, HTML/CSS/JavaScript front end. Layers: validators → routes → repository (MySQL or in-memory).

## 3. Features to be tested
| ID | Feature | Risk |
|---|---|---|
| F1 | Registration with field validation (name, email, phone, password) | High |
| F2 | Login, logout and session handling | High |
| F3 | Comments (post, list, input restrictions) | Medium |
| F4 | COVID statistics display | Low |
| F6 | Persistent login, profile, comment count and comment history, delete own comment | High |
| F5 | Security: password hashing, SQL injection, XSS, oversized/malformed requests | High |

Not tested: browser UI automation, load/performance, real MySQL server (covered by manual demo steps in README).

## 4. Test approach
- **White-box unit testing** of `src/validators.js` using statement/branch coverage, equivalence partitioning, boundary value analysis and error guessing.
- **Black-box integration testing** of the HTTP API (routes + validators + bcrypt + sessions + repository) using Supertest with an in-memory repository, so tests are repeatable and need no database.
- **Manual black-box testing** of the UI through the in-page *Test lab* tab and the demo checklist in README.

## 5. Tools
Jest 29 (runner, coverage), Supertest (HTTP assertions), Node.js, MySQL Workbench / CLI (data checks).

## 6. Environment
Windows/Linux/macOS, Node.js 18+, MySQL 8, browser: Chrome or Edge.

## 7. Entry and exit criteria
- Entry: `npm install` succeeds; code compiles and starts.
- Pass/Fail of a test: actual result equals expected result in TEST_CASES.md.
- Exit / acceptance: 100% tests pass = **Accepted**; 95–99.9% = **Conditionally accepted**; below 95% or any open Critical/Major bug = **Rejected**.

## 8. Deliverables
Test plan, bug taxonomy and bug log, test cases with procedures, automated test scripts, test report (`npm run report` generates `TEST_REPORT.md`).

## 9. Risks
Regex rules may reject legitimate unusual names or emails; MySQL unavailable at demo (mitigation: integration tests run without it).
