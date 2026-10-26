# Test Cases and Test Procedures

Run everything: `npm test`. Run one level: `npm run test:unit` or `npm run test:integration`.
Technique key: **EP** equivalence partitioning, **BVA** boundary value analysis, **EG** error guessing.

## A. Unit tests (white-box) – file `tests/unit/validators.test.js`
**Procedure:** call `valid(field, input)`; compare the boolean result with the expected value.

| IDs | Field | Scenarios | Expected |
|---|---|---|---|
| UT-01 – UT-07 | name | valid name; length 3, 2, 30, 31; digits; leading space | accept: 01, 02, 04 · reject: others |
| UT-08 – UT-14 | email | valid; plus-tag multi-level domain; no @; no TLD; space; double @; over 100 chars | accept: 08, 09 · reject: others |
| UT-15 – UT-20 | phone | valid; starts with 6; 9 digits; 11 digits; starts with 5; letters | accept: 15, 16 · reject: others |
| UT-21 – UT-29 | password | valid; length 8, 7, 32, 33; missing symbol / upper / lower / digit | accept: 21, 22, 24 · reject: others |
| UT-30 – UT-36 | comment | valid; length 3, 2, 200, 201; `<script>` tag; spaces only | accept: 30, 31, 33 · reject: others |
| UT-37 – UT-41 | robustness | undefined, null, number, object, unknown field name | always reject |

## B. Integration tests (black-box) – file `tests/integration/api.test.js`
**Procedure:** send HTTP request to the Express app, check status code and body.

| ID | Scenario | Input | Expected |
|---|---|---|---|
| IT-01 | View statistics | GET /api/stats | 200, array |
| IT-02 | Register valid user | valid form | 201; stored password is a bcrypt hash |
| IT-03 | Duplicate email, different letter case | same email | 409 |
| IT-04 – IT-07 | Invalid name / email / phone / password | one bad field | 422 with message for that field |
| IT-08 | Confirm password mismatch | different confirm | 422 |
| IT-09 | Login unknown email | no@one.com | 401 |
| IT-10 | Login wrong password | wrong password | 401 |
| IT-11 | Login valid | correct credentials | 200; response has no password/hash |
| IT-12 | Session | /me before and after login | null, then user name |
| IT-13 | Comment without login | text | 401 |
| IT-14 | XSS comment | `<script>alert(1)</script>` | 422 |
| IT-15 | Valid comment | text | 201; appears first in list |
| IT-16 | SQL injection text | `x'); DROP TABLE users;--` | 201; stored as plain data |
| IT-17 | Logout | POST /api/logout | session ended; comment gives 401 |
| IT-18 | Malformed JSON | `{bad json` | 400 |
| IT-19 | Unknown endpoint | GET /api/nothing | 404 |
| IT-20 | Oversized body | 20 KB name | 413 |

| IT-21 | Login survives server restart | new app instance, same session cookie | /me returns the user |
| IT-22 | Profile after login | valid login | user has name, email, commentCount 0 |
| IT-23 | Comment count | post 2 comments | /me commentCount = 2 |
| IT-24 | Comment history | 2 users post comments | /my/comments has only own, newest first |
| IT-25 | History without login | GET /api/my/comments | 401 |
| IT-26 | Delete own comment | DELETE /api/comments/:id | 200; count decreases |
| IT-27 | Delete another user's comment | DELETE by other user | 404; comment remains |
| IT-28 | Delete without login | DELETE /api/comments/1 | 401 |
| IT-29 | Community totals | GET /api/overview | members and comments counts |
| IT-30 | Ownership data in feed | GET /api/comments | each item has id and uid |

## C. Manual UI test procedure (demo)
1. Open http://localhost:3000, check the table, search box "India" and sorting.
2. Try weak passwords (e.g. `demo1234`) on Register – error shown and meter stays red/amber.
3. Register a valid user; confirm the row exists in MySQL and `password_hash` starts with `$2`.
4. Log in: header shows your name and count, Register/Log in buttons are gone. Post a comment, refresh the page and close/reopen the browser – you are still logged in and the comment remains. Post `<b>hi</b>` – rejected.
5. Open **My activity**: count and history match the database (`SELECT * FROM comments`). Delete one comment – count drops.
6. Open **Test lab** tab → Run all tests → 24 of 24 pass.
