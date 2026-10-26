# Test Report – CovidWatch

| Item | Value |
|---|---|
| Date | 2026-10-23 |
| Environment | Node v22.17.1, Windows_NT 10.0.26200, Jest 29, Supertest |
| Total test cases | 71 |
| Passed / Failed | 71 / 0 |
| Pass rate | 100.0% |
| Code coverage | Statements 97.26% | Branches 82.71% | Functions 96.22% | Lines 98.92% |

## Pass/Fail criteria applied
- A test **passes** when the actual result equals the expected result in docs/TEST_CASES.md.
- Application is **ACCEPTED** when 100% of tests pass, **CONDITIONALLY ACCEPTED** at 95–99.9%, otherwise **REJECTED**.

## Verdict: ACCEPTED

## Results
| # | Level | Test case | Result |
|---|---|---|---|
| 1 | Unit (white-box) | UT-01 name: EP valid full name | PASS |
| 2 | Unit (white-box) | UT-02 name: BVA min length 3 | PASS |
| 3 | Unit (white-box) | UT-03 name: BVA below min (2) | PASS |
| 4 | Unit (white-box) | UT-04 name: BVA max length 30 | PASS |
| 5 | Unit (white-box) | UT-05 name: BVA above max (31) | PASS |
| 6 | Unit (white-box) | UT-06 name: EP contains digits | PASS |
| 7 | Unit (white-box) | UT-07 name: EG leading space | PASS |
| 8 | Unit (white-box) | UT-08 email: EP valid email | PASS |
| 9 | Unit (white-box) | UT-09 email: EP plus-tag and multi-level domain | PASS |
| 10 | Unit (white-box) | UT-10 email: EP missing @ | PASS |
| 11 | Unit (white-box) | UT-11 email: EP missing TLD | PASS |
| 12 | Unit (white-box) | UT-12 email: EG contains space | PASS |
| 13 | Unit (white-box) | UT-13 email: EG double @ | PASS |
| 14 | Unit (white-box) | UT-14 email: BVA above 100 chars | PASS |
| 15 | Unit (white-box) | UT-15 phone: EP valid mobile | PASS |
| 16 | Unit (white-box) | UT-16 phone: BVA first digit 6 | PASS |
| 17 | Unit (white-box) | UT-17 phone: BVA 9 digits | PASS |
| 18 | Unit (white-box) | UT-18 phone: BVA 11 digits | PASS |
| 19 | Unit (white-box) | UT-19 phone: EP starts with 5 | PASS |
| 20 | Unit (white-box) | UT-20 phone: EG letters | PASS |
| 21 | Unit (white-box) | UT-21 pass: EP valid password | PASS |
| 22 | Unit (white-box) | UT-22 pass: BVA min length 8 | PASS |
| 23 | Unit (white-box) | UT-23 pass: BVA below min (7) | PASS |
| 24 | Unit (white-box) | UT-24 pass: BVA max length 32 | PASS |
| 25 | Unit (white-box) | UT-25 pass: BVA above max (33) | PASS |
| 26 | Unit (white-box) | UT-26 pass: EP missing symbol | PASS |
| 27 | Unit (white-box) | UT-27 pass: EP missing uppercase | PASS |
| 28 | Unit (white-box) | UT-28 pass: EP missing lowercase | PASS |
| 29 | Unit (white-box) | UT-29 pass: EP missing digit | PASS |
| 30 | Unit (white-box) | UT-30 comment: EP valid comment | PASS |
| 31 | Unit (white-box) | UT-31 comment: BVA min length 3 | PASS |
| 32 | Unit (white-box) | UT-32 comment: BVA below min (2) | PASS |
| 33 | Unit (white-box) | UT-33 comment: BVA max length 200 | PASS |
| 34 | Unit (white-box) | UT-34 comment: BVA above max (201) | PASS |
| 35 | Unit (white-box) | UT-35 comment: EG XSS script tag | PASS |
| 36 | Unit (white-box) | UT-36 comment: EG whitespace only | PASS |
| 37 | Unit (white-box) | UT-37 non-string input is rejected (undefined) | PASS |
| 38 | Unit (white-box) | UT-38 non-string input is rejected (null) | PASS |
| 39 | Unit (white-box) | UT-39 non-string input is rejected (12345) | PASS |
| 40 | Unit (white-box) | UT-40 non-string input is rejected ({}) | PASS |
| 41 | Unit (white-box) | UT-41 unknown field name is rejected | PASS |
| 42 | Integration (black-box) | IT-01 GET /api/stats returns the statistics list | PASS |
| 43 | Integration (black-box) | IT-02 register valid user returns 201 and stores a hashed password | PASS |
| 44 | Integration (black-box) | IT-03 duplicate email (any letter case) returns 409 | PASS |
| 45 | Integration (black-box) | IT-04 invalid name returns 422 with field message | PASS |
| 46 | Integration (black-box) | IT-05 invalid email returns 422 with field message | PASS |
| 47 | Integration (black-box) | IT-06 invalid phone returns 422 with field message | PASS |
| 48 | Integration (black-box) | IT-07 invalid password returns 422 with field message | PASS |
| 49 | Integration (black-box) | IT-08 password and confirm mismatch returns 422 | PASS |
| 50 | Integration (black-box) | IT-09 login with unknown email returns 401 | PASS |
| 51 | Integration (black-box) | IT-10 login with wrong password returns 401 | PASS |
| 52 | Integration (black-box) | IT-11 valid login returns 200 and never leaks password data | PASS |
| 53 | Integration (black-box) | IT-12 session: /me is null before login and shows name after login | PASS |
| 54 | Integration (black-box) | IT-13 posting a comment without login returns 401 | PASS |
| 55 | Integration (black-box) | IT-14 XSS comment is rejected with 422 | PASS |
| 56 | Integration (black-box) | IT-15 valid comment is saved and appears in the list | PASS |
| 57 | Integration (black-box) | IT-16 SQL-injection text is stored literally as data | PASS |
| 58 | Integration (black-box) | IT-17 logout ends the session | PASS |
| 59 | Integration (black-box) | IT-18 malformed JSON returns 400 | PASS |
| 60 | Integration (black-box) | IT-19 unknown API endpoint returns 404 | PASS |
| 61 | Integration (black-box) | IT-20 oversized body (>10 KB) is rejected with 413 | PASS |
| 62 | Integration (black-box) | IT-21 login survives a server restart (DB-backed session) | PASS |
| 63 | Integration (black-box) | IT-22 login returns profile with email and zero comment count | PASS |
| 64 | Integration (black-box) | IT-23 comment count in /me increases with every post | PASS |
| 65 | Integration (black-box) | IT-24 /my/comments returns only own comments, newest first | PASS |
| 66 | Integration (black-box) | IT-25 /my/comments without login returns 401 | PASS |
| 67 | Integration (black-box) | IT-26 deleting own comment returns 200 and lowers the count | PASS |
| 68 | Integration (black-box) | IT-27 deleting another user's comment returns 404 and keeps it | PASS |
| 69 | Integration (black-box) | IT-28 deleting a comment without login returns 401 | PASS |
| 70 | Integration (black-box) | IT-29 /overview returns member and comment totals | PASS |
| 71 | Integration (black-box) | IT-30 comment list exposes id and author id for ownership checks | PASS |

## Defects found
Record any failed case in the bug log in docs/BUG_TAXONOMY.md with its severity and category.
