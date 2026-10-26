// Builds docs/TEST_REPORT.md from Jest results. Run: npm run report
const fs = require('fs'), os = require('os');
const r = JSON.parse(fs.readFileSync('docs/jest-results.json', 'utf8'));
let cov = 'n/a';
try { const c = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8')).total;
  cov = `Statements ${c.statements.pct}% | Branches ${c.branches.pct}% | Functions ${c.functions.pct}% | Lines ${c.lines.pct}%`; } catch (e) {}
const rows = [];
r.testResults.forEach((s) => s.assertionResults.forEach((a) =>
  rows.push([/[\\/]unit[\\/]/.test(s.name) ? 'Unit (white-box)' : 'Integration (black-box)', a.title, a.status === 'passed' ? 'PASS' : 'FAIL'])));
const pass = rows.filter((x) => x[2] === 'PASS').length, total = rows.length, rate = (pass / total) * 100;
const verdict = rate === 100 ? 'ACCEPTED' : rate >= 95 ? 'CONDITIONALLY ACCEPTED (fix listed defects)' : 'REJECTED';
const md = `# Test Report – CovidWatch

| Item | Value |
|---|---|
| Date | ${new Date().toISOString().slice(0, 10)} |
| Environment | Node ${process.version}, ${os.type()} ${os.release()}, Jest 29, Supertest |
| Total test cases | ${total} |
| Passed / Failed | ${pass} / ${total - pass} |
| Pass rate | ${rate.toFixed(1)}% |
| Code coverage | ${cov} |

## Pass/Fail criteria applied
- A test **passes** when the actual result equals the expected result in docs/TEST_CASES.md.
- Application is **ACCEPTED** when 100% of tests pass, **CONDITIONALLY ACCEPTED** at 95–99.9%, otherwise **REJECTED**.

## Verdict: ${verdict}

## Results
| # | Level | Test case | Result |
|---|---|---|---|
${rows.map((x, i) => `| ${i + 1} | ${x[0]} | ${x[1].replace(/\|/g, '/')} | ${x[2]} |`).join('\n')}

## Defects found
Record any failed case in the bug log in docs/BUG_TAXONOMY.md with its severity and category.
`;
fs.writeFileSync('docs/TEST_REPORT.md', md);
console.log(`Report written: ${pass}/${total} passed -> ${verdict}`);
