// Single source of truth for validation rules (mirrored in public/js/app.js).
const RX = {
  name: /^[A-Za-z][A-Za-z .'’-]{2,29}$/,
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
  phone: /^[6-9]\d{9}$/,
  pass: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/,
  comment: /^(?!\s*$)[^<>]{3,200}$/,
};
function valid(field, value) {
  if (typeof value !== 'string' || !RX[field]) return false;
  if (field === 'email' && value.length > 100) return false;
  return RX[field].test(value);
}
module.exports = { RX, valid };
