/**
 * gstin-utils — Example Usage
 *
 * Run this file with:
 *   npx ts-node examples/usage.ts
 *
 * Or after building:
 *   node examples/usage.js  (compile first with `npm run build`)
 */

const {
  normalizeGSTIN,
  isValidGSTIN,
  validateGSTIN,
  parseGSTIN,
  getStateCodeFromGSTIN,
  getStateNameFromGSTIN,
  getPANFromGSTIN,
  maskGSTIN,
  isValidStateCode,
  computeChecksum,
  getAllStateCodes,
} = require('../dist');

// ── 1. Normalize ─────────────────────────────────────────────────────────────
console.log('━━━ normalizeGSTIN ━━━');
console.log(normalizeGSTIN('  27aapfu0939f1zv  '));
// → "27AAPFU0939F1ZV"
console.log(normalizeGSTIN(null));
// → ""
console.log();

// ── 2. Quick Validation ──────────────────────────────────────────────────────
console.log('━━━ isValidGSTIN ━━━');
console.log(isValidGSTIN('27AAPFU0939F1ZV'));
// → true
console.log(isValidGSTIN('INVALIDGSTIN123'));
// → false
console.log(isValidGSTIN(undefined));
// → false
console.log();

// ── 3. Detailed Validation ───────────────────────────────────────────────────
console.log('━━━ validateGSTIN ━━━');
console.log(JSON.stringify(validateGSTIN('27AAPFU0939F1ZV'), null, 2));
// → { isValid: true, formatValid: true, ... errors: [] }

console.log(JSON.stringify(validateGSTIN('00AAPFU0939F1ZV'), null, 2));
// → { isValid: false, stateCodeValid: false, ... errors: [...] }
console.log();

// ── 4. Parse GSTIN ───────────────────────────────────────────────────────────
console.log('━━━ parseGSTIN ━━━');
console.log(JSON.stringify(parseGSTIN('27AAPFU0939F1ZV'), null, 2));
// → { gstin: '27AAPFU0939F1ZV', stateCode: '27', stateName: 'Maharashtra', pan: 'AAPFU0939F', ... }
console.log();

// ── 5. Extract State Code & Name ─────────────────────────────────────────────
console.log('━━━ getStateCodeFromGSTIN / getStateNameFromGSTIN ━━━');
console.log(getStateCodeFromGSTIN('27AAPFU0939F1ZV'));
// → "27"
console.log(getStateNameFromGSTIN('27AAPFU0939F1ZV'));
// → "Maharashtra"
console.log(getStateNameFromGSTIN('07AAPFU0939F1ZV'));
// → "Delhi"
console.log();

// ── 6. Extract PAN ───────────────────────────────────────────────────────────
console.log('━━━ getPANFromGSTIN ━━━');
console.log(getPANFromGSTIN('27AAPFU0939F1ZV'));
// → "AAPFU0939F"
console.log();

// ── 7. Mask GSTIN ────────────────────────────────────────────────────────────
console.log('━━━ maskGSTIN ━━━');
console.log(maskGSTIN('27AAPFU0939F1ZV'));
// → "27AAP****39F1ZV"
console.log();

// ── 8. Validate State Code ───────────────────────────────────────────────────
console.log('━━━ isValidStateCode ━━━');
console.log(isValidStateCode('27'));
// → true
console.log(isValidStateCode('00'));
// → false
console.log();

// ── 9. Compute Checksum ──────────────────────────────────────────────────────
console.log('━━━ computeChecksum ━━━');
console.log(computeChecksum('27AAPFU0939F1ZV'));
// → "V"
console.log();

// ── 10. List All State Codes ─────────────────────────────────────────────────
console.log('━━━ getAllStateCodes ━━━');
console.log(getAllStateCodes());
// → ['01', '02', '03', ... ]
