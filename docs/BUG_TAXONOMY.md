# Bug Taxonomy and Bug Log

## 1. Classification by category
| Code | Category | Example in this project |
|---|---|---|
| FUN | Functional | Valid user cannot register |
| VAL | Input validation | Weak password accepted |
| SEC | Security | Plain-text password, XSS or SQL injection possible |
| SES | Session/authentication | Comment allowed after logout |
| DB | Data/database | Duplicate rows, wrong data type |
| UI | User interface | Text unreadable, form not responsive |
| PERF | Performance | Page slower than 3 seconds |
| COMP | Compatibility | Fails on a browser |
| DOC | Documentation | Wrong setup step in README |

## 2. Severity and priority
| Severity | Meaning | Fix priority |
|---|---|---|
| Critical | Data loss, security hole, app crash | Immediate |
| Major | Main feature broken, no workaround | High |
| Minor | Feature works with a workaround | Medium |
| Trivial | Cosmetic | Low |

## 3. Bug report template
`ID | Title | Category | Severity | Steps to reproduce | Expected | Actual | Test case ID | Status (New/Assigned/Fixed/Verified/Closed)`

## 4. Bug log
| ID | Title | Category | Severity | Test case | Status |
|---|---|---|---|---|---|
| BUG-001 | Login lost after browser restart or server restart (session kept in memory, cookie not persistent) | SES | Major | IT-21 | Verified – sessions stored in MySQL, 7-day cookie |
| BUG-002 | Logged-in user's name not shown anywhere | FUN | Minor | Manual UI step 4 | Verified – header shows avatar, name, comment count |
| BUG-003 | Register and Log in buttons still visible after login | UI | Minor | Manual UI step 4 | Verified – hidden when logged in, redirect to feed |
| BUG-004 | No per-user comment count or history | FUN | Major | IT-23, IT-24 | Verified – My activity page and /api/my/comments |
| BUG-005 | Front-end script cut in half by the build step (literal `</script>` inside a test string) – no buttons worked | FUN | Critical | Manual UI step 1 | Verified – script moved to js/app.js |
