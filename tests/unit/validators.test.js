const { valid } = require('../../src/validators');
const r = (c, n) => c.repeat(n);
// [id, field, technique/description, input, expected]  EP=equivalence partitioning, BVA=boundary values, EG=error guessing
const rows = [
  ['UT-01', 'name', 'EP valid full name', 'Rahul Patil', true],
  ['UT-02', 'name', 'BVA min length 3', 'Raj', true],
  ['UT-03', 'name', 'BVA below min (2)', 'Ra', false],
  ['UT-04', 'name', 'BVA max length 30', 'A' + r('b', 29), true],
  ['UT-05', 'name', 'BVA above max (31)', 'A' + r('b', 30), false],
  ['UT-06', 'name', 'EP contains digits', 'Rahul123', false],
  ['UT-07', 'name', 'EG leading space', ' Rahul', false],
  ['UT-08', 'email', 'EP valid email', 'user@example.com', true],
  ['UT-09', 'email', 'EP plus-tag and multi-level domain', 'user.name+tag@mail.co.in', true],
  ['UT-10', 'email', 'EP missing @', 'userexample.com', false],
  ['UT-11', 'email', 'EP missing TLD', 'user@example', false],
  ['UT-12', 'email', 'EG contains space', 'us er@mail.com', false],
  ['UT-13', 'email', 'EG double @', 'user@@mail.com', false],
  ['UT-14', 'email', 'BVA above 100 chars', r('a', 92) + '@mail.com', false],
  ['UT-15', 'phone', 'EP valid mobile', '9876543210', true],
  ['UT-16', 'phone', 'BVA first digit 6', '6000000000', true],
  ['UT-17', 'phone', 'BVA 9 digits', '987654321', false],
  ['UT-18', 'phone', 'BVA 11 digits', '98765432101', false],
  ['UT-19', 'phone', 'EP starts with 5', '5876543210', false],
  ['UT-20', 'phone', 'EG letters', '98765abcde', false],
  ['UT-21', 'pass', 'EP valid password', 'Covid@2026', true],
  ['UT-22', 'pass', 'BVA min length 8', 'Ab1@xyzq', true],
  ['UT-23', 'pass', 'BVA below min (7)', 'Ab1@xyz', false],
  ['UT-24', 'pass', 'BVA max length 32', 'Aa1@' + r('x', 28), true],
  ['UT-25', 'pass', 'BVA above max (33)', 'Aa1@' + r('x', 29), false],
  ['UT-26', 'pass', 'EP missing symbol', 'Covid2026', false],
  ['UT-27', 'pass', 'EP missing uppercase', 'covid@2026', false],
  ['UT-28', 'pass', 'EP missing lowercase', 'COVID@2026', false],
  ['UT-29', 'pass', 'EP missing digit', 'Covid@abcd', false],
  ['UT-30', 'comment', 'EP valid comment', 'Wash your hands often.', true],
  ['UT-31', 'comment', 'BVA min length 3', 'abc', true],
  ['UT-32', 'comment', 'BVA below min (2)', 'ab', false],
  ['UT-33', 'comment', 'BVA max length 200', r('a', 200), true],
  ['UT-34', 'comment', 'BVA above max (201)', r('a', 201), false],
  ['UT-35', 'comment', 'EG XSS script tag', '<script>alert(1)</script>', false],
  ['UT-36', 'comment', 'EG whitespace only', '     ', false],
];
test.each(rows)('%s %s: %s', (id, field, desc, input, expected) => {
  expect(valid(field, input)).toBe(expected);
});
test.each([['UT-37', undefined], ['UT-38', null], ['UT-39', 12345], ['UT-40', {}]])(
  '%s non-string input is rejected (%p)', (id, v) => { expect(valid('name', v)).toBe(false); });
test('UT-41 unknown field name is rejected', () => { expect(valid('nope', 'abc')).toBe(false); });
