import {
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
  isChecksumValid,
  STATE_CODE_MAP,
  getAllStateCodes,
  getStateNameByCode,
} from '../src';

// ---------------------------------------------------------------------------
// normalizeGSTIN
// ---------------------------------------------------------------------------
describe('normalizeGSTIN', () => {
  it('trims whitespace and converts to uppercase', () => {
    expect(normalizeGSTIN('  27aapfu0939f1zv  ')).toBe('27AAPFU0939F1ZV');
  });

  it('returns empty string for null', () => {
    expect(normalizeGSTIN(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(normalizeGSTIN(undefined)).toBe('');
  });

  it('returns empty string for number input', () => {
    expect(normalizeGSTIN(12345)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(normalizeGSTIN('')).toBe('');
  });

  it('handles already-uppercase input', () => {
    expect(normalizeGSTIN('27AAPFU0939F1ZV')).toBe('27AAPFU0939F1ZV');
  });

  it('handles mixed case', () => {
    expect(normalizeGSTIN('27AapFu0939f1Zv')).toBe('27AAPFU0939F1ZV');
  });
});

// ---------------------------------------------------------------------------
// isValidGSTIN
// ---------------------------------------------------------------------------
describe('isValidGSTIN', () => {
  it('returns true for a valid GSTIN', () => {
    expect(isValidGSTIN('27AAPFU0939F1ZV')).toBe(true);
  });

  it('returns true for lowercase valid GSTIN (auto-normalized)', () => {
    expect(isValidGSTIN('27aapfu0939f1zv')).toBe(true);
  });

  it('returns false for wrong length', () => {
    expect(isValidGSTIN('27AAPFU0939F1Z')).toBe(false);
    expect(isValidGSTIN('27AAPFU0939F1ZVX')).toBe(false);
  });

  it('returns false for invalid state code', () => {
    expect(isValidGSTIN('00AAPFU0939F1ZV')).toBe(false);
  });

  it('returns false for invalid format', () => {
    expect(isValidGSTIN('ZZAAPFU0939F1ZV')).toBe(false);
  });

  it('returns false for null/undefined/empty', () => {
    expect(isValidGSTIN(null)).toBe(false);
    expect(isValidGSTIN(undefined)).toBe(false);
    expect(isValidGSTIN('')).toBe(false);
  });

  it('returns false for wrong checksum', () => {
    // Change last char from V to A
    expect(isValidGSTIN('27AAPFU0939F1ZA')).toBe(false);
  });

  it('returns false for numeric input', () => {
    expect(isValidGSTIN(123456789012345)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateGSTIN
// ---------------------------------------------------------------------------
describe('validateGSTIN', () => {
  it('returns all-valid result for a correct GSTIN', () => {
    const result = validateGSTIN('27AAPFU0939F1ZV');
    expect(result.isValid).toBe(true);
    expect(result.formatValid).toBe(true);
    expect(result.lengthValid).toBe(true);
    expect(result.stateCodeValid).toBe(true);
    expect(result.panSegmentValid).toBe(true);
    expect(result.entityCodeValid).toBe(true);
    expect(result.defaultZValid).toBe(true);
    expect(result.checksumValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports length error for short input', () => {
    const result = validateGSTIN('27AAP');
    expect(result.isValid).toBe(false);
    expect(result.lengthValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('15 characters');
  });

  it('reports invalid state code', () => {
    // 00 is not a valid state code; keep rest of format valid
    const result = validateGSTIN('00AAPFU0939F1ZV');
    expect(result.stateCodeValid).toBe(false);
    expect(result.errors.some((e) => e.includes('state'))).toBe(true);
  });

  it('reports invalid PAN segment', () => {
    // Replace PAN with invalid pattern (digits where letters should be)
    const result = validateGSTIN('271111111111AZA');
    expect(result.panSegmentValid).toBe(false);
  });

  it('reports invalid default Z character', () => {
    // Replace Z (index 13) with 'A'
    const result = validateGSTIN('27AAPFU0939F1AV');
    expect(result.defaultZValid).toBe(false);
  });

  it('reports checksum error', () => {
    const result = validateGSTIN('27AAPFU0939F1ZA');
    expect(result.checksumValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Checksum'))).toBe(true);
  });

  it('handles null input gracefully', () => {
    const result = validateGSTIN(null);
    expect(result.isValid).toBe(false);
    expect(result.lengthValid).toBe(false);
  });

  it('handles empty string input', () => {
    const result = validateGSTIN('');
    expect(result.isValid).toBe(false);
    expect(result.lengthValid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseGSTIN
// ---------------------------------------------------------------------------
describe('parseGSTIN', () => {
  it('parses a valid GSTIN into its parts', () => {
    const result = parseGSTIN('27AAPFU0939F1ZV');
    expect(result).not.toBeNull();
    expect(result!.gstin).toBe('27AAPFU0939F1ZV');
    expect(result!.normalized).toBe('27AAPFU0939F1ZV');
    expect(result!.stateCode).toBe('27');
    expect(result!.stateName).toBe('Maharashtra');
    expect(result!.pan).toBe('AAPFU0939F');
    expect(result!.entityCode).toBe('1');
    expect(result!.defaultChar).toBe('Z');
    expect(result!.checksum).toBe('V');
    expect(result!.isValid).toBe(true);
  });

  it('returns null for input shorter than 15 chars', () => {
    expect(parseGSTIN('27AAP')).toBeNull();
    expect(parseGSTIN('')).toBeNull();
    expect(parseGSTIN(null)).toBeNull();
    expect(parseGSTIN(undefined)).toBeNull();
  });

  it('preserves original input in gstin field', () => {
    const result = parseGSTIN('  27aapfu0939f1zv  ');
    expect(result).not.toBeNull();
    expect(result!.gstin).toBe('27aapfu0939f1zv');
    expect(result!.normalized).toBe('27AAPFU0939F1ZV');
  });

  it('shows "Unknown" for unrecognized state code', () => {
    // 00 is not in the state map
    const result = parseGSTIN('00AAPFU0939F1ZV');
    expect(result).not.toBeNull();
    expect(result!.stateName).toBe('Unknown');
    expect(result!.isValid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStateCodeFromGSTIN
// ---------------------------------------------------------------------------
describe('getStateCodeFromGSTIN', () => {
  it('extracts state code from valid GSTIN', () => {
    expect(getStateCodeFromGSTIN('27AAPFU0939F1ZV')).toBe('27');
  });

  it('extracts state code from lowercase GSTIN', () => {
    expect(getStateCodeFromGSTIN('27aapfu0939f1zv')).toBe('27');
  });

  it('returns null for very short input', () => {
    expect(getStateCodeFromGSTIN('2')).toBeNull();
    expect(getStateCodeFromGSTIN('')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(getStateCodeFromGSTIN(null)).toBeNull();
    expect(getStateCodeFromGSTIN(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getStateNameFromGSTIN
// ---------------------------------------------------------------------------
describe('getStateNameFromGSTIN', () => {
  it('returns state name for valid GSTIN', () => {
    expect(getStateNameFromGSTIN('27AAPFU0939F1ZV')).toBe('Maharashtra');
  });

  it('returns null for unknown state code', () => {
    expect(getStateNameFromGSTIN('00AAPFU0939F1ZV')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(getStateNameFromGSTIN('')).toBeNull();
    expect(getStateNameFromGSTIN(null)).toBeNull();
  });

  it('works with different state codes', () => {
    expect(getStateNameFromGSTIN('07AAPFU0939F1ZV')).toBe('Delhi');
    expect(getStateNameFromGSTIN('33AAPFU0939F1ZV')).toBe('Tamil Nadu');
    expect(getStateNameFromGSTIN('29AAPFU0939F1ZV')).toBe('Karnataka');
  });
});

// ---------------------------------------------------------------------------
// getPANFromGSTIN
// ---------------------------------------------------------------------------
describe('getPANFromGSTIN', () => {
  it('extracts PAN from valid GSTIN', () => {
    expect(getPANFromGSTIN('27AAPFU0939F1ZV')).toBe('AAPFU0939F');
  });

  it('works with lowercase input', () => {
    expect(getPANFromGSTIN('27aapfu0939f1zv')).toBe('AAPFU0939F');
  });

  it('returns null for short input', () => {
    expect(getPANFromGSTIN('27AAPFU093')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(getPANFromGSTIN(null)).toBeNull();
    expect(getPANFromGSTIN(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// maskGSTIN
// ---------------------------------------------------------------------------
describe('maskGSTIN', () => {
  it('masks a valid GSTIN', () => {
    expect(maskGSTIN('27AAPFU0939F1ZV')).toBe('27AAP****39F1ZV');
  });

  it('masks lowercase input (after normalization)', () => {
    expect(maskGSTIN('27aapfu0939f1zv')).toBe('27AAP****39F1ZV');
  });

  it('returns null for short input', () => {
    expect(maskGSTIN('27AAP')).toBeNull();
    expect(maskGSTIN('')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(maskGSTIN(null)).toBeNull();
    expect(maskGSTIN(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isValidStateCode
// ---------------------------------------------------------------------------
describe('isValidStateCode', () => {
  it('returns true for known state codes', () => {
    expect(isValidStateCode('01')).toBe(true);
    expect(isValidStateCode('27')).toBe(true);
    expect(isValidStateCode('37')).toBe(true);
    expect(isValidStateCode('99')).toBe(true);
  });

  it('returns false for unknown codes', () => {
    expect(isValidStateCode('00')).toBe(false);
    expect(isValidStateCode('40')).toBe(false);
    expect(isValidStateCode('98')).toBe(false);
  });

  it('returns false for non-string input', () => {
    expect(isValidStateCode(27)).toBe(false);
    expect(isValidStateCode(null)).toBe(false);
    expect(isValidStateCode(undefined)).toBe(false);
  });

  it('handles whitespace-padded codes', () => {
    expect(isValidStateCode(' 27 ')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Checksum utilities
// ---------------------------------------------------------------------------
describe('computeChecksum', () => {
  it('computes correct checksum for known GSTIN', () => {
    expect(computeChecksum('27AAPFU0939F1ZV')).toBe('V');
  });

  it('computes checksum that differs for altered input', () => {
    const checksum = computeChecksum('27AAPFU0939F1ZA');
    expect(checksum).not.toBe('A');
    expect(checksum).toBe('V'); // correct checksum is still V
  });
});

describe('isChecksumValid', () => {
  it('returns true for valid GSTIN', () => {
    expect(isChecksumValid('27AAPFU0939F1ZV')).toBe(true);
  });

  it('returns false for tampered checksum', () => {
    expect(isChecksumValid('27AAPFU0939F1ZA')).toBe(false);
  });

  it('returns false for non-15-char input', () => {
    expect(isChecksumValid('27AAPFU')).toBe(false);
  });

  it('returns false for non-string input', () => {
    expect(isChecksumValid(123456789012345 as any)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// State code data helpers
// ---------------------------------------------------------------------------
describe('STATE_CODE_MAP', () => {
  it('contains Maharashtra as 27', () => {
    expect(STATE_CODE_MAP['27']).toBe('Maharashtra');
  });

  it('contains Delhi as 07', () => {
    expect(STATE_CODE_MAP['07']).toBe('Delhi');
  });

  it('contains special code 97', () => {
    expect(STATE_CODE_MAP['97']).toBe('Other Territory');
  });
});

describe('getAllStateCodes', () => {
  it('returns an array of strings', () => {
    const codes = getAllStateCodes();
    expect(Array.isArray(codes)).toBe(true);
    expect(codes.length).toBeGreaterThan(30);
    expect(codes).toContain('27');
    expect(codes).toContain('07');
  });
});

describe('getStateNameByCode', () => {
  it('returns state name for valid code', () => {
    expect(getStateNameByCode('27')).toBe('Maharashtra');
  });

  it('returns undefined for invalid code', () => {
    expect(getStateNameByCode('00')).toBeUndefined();
  });

  it('returns undefined for non-string', () => {
    expect(getStateNameByCode(27 as any)).toBeUndefined();
  });

  it('trims whitespace', () => {
    expect(getStateNameByCode(' 27 ')).toBe('Maharashtra');
  });
});
