/**
 * @module gstin-utils/validator
 *
 * Core GSTIN validation and utility functions.
 * All functions accept raw user input and handle edge cases gracefully.
 */

import { GSTINValidationResult, GSTINParsedResult } from './types';
import { STATE_CODE_MAP, getStateNameByCode } from './state-codes';
import { computeChecksum, isChecksumValid } from './checksum';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Regex pattern for a structurally valid GSTIN.
 *
 * Breakdown:
 *   ^                  — start of string
 *   [0-9]{2}           — 2-digit state code
 *   [A-Z]{5}           — 5 letters of PAN (first 5 chars: entity type + name)
 *   [0-9]{4}           — 4 digits of PAN
 *   [A-Z]              — 1 letter of PAN (check letter)
 *   [1-9A-Z]           — entity code (1–9 or A–Z, never 0)
 *   Z                  — default reserved character
 *   [0-9A-Z]           — checksum character
 *   $                  — end of string
 */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/**
 * Regex pattern for a valid PAN segment (characters 3–12 of GSTIN).
 *
 * PAN format: AAAAA9999A
 *   5 uppercase letters + 4 digits + 1 uppercase letter
 */
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// ---------------------------------------------------------------------------
// Helpers (internal)
// ---------------------------------------------------------------------------

/**
 * Safely coerces input to a trimmed, uppercased string.
 * Returns an empty string for null, undefined, or non-string values.
 *
 * @internal
 */
function sanitize(input: unknown): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return '';
  return input.trim().toUpperCase();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Normalizes a GSTIN string by trimming whitespace and converting
 * to uppercase. Useful before storing or comparing GSTINs.
 *
 * @param gstin - Raw GSTIN input
 * @returns Cleaned GSTIN string (trimmed + uppercased)
 *
 * @example
 * ```ts
 * normalizeGSTIN('  27aapfu0939f1zv  '); // "27AAPFU0939F1ZV"
 * normalizeGSTIN(null);                   // ""
 * ```
 */
export function normalizeGSTIN(gstin: unknown): string {
  return sanitize(gstin);
}

/**
 * Quick boolean check: is the given GSTIN structurally valid?
 *
 * This checks length, format regex, state code validity, and checksum.
 * For detailed diagnostics, use `validateGSTIN()` instead.
 *
 * @param gstin - Raw GSTIN input
 * @returns `true` if valid, `false` otherwise
 *
 * @example
 * ```ts
 * isValidGSTIN('27AAPFU0939F1ZV'); // true
 * isValidGSTIN('INVALIDGSTIN');     // false
 * isValidGSTIN(undefined);          // false
 * ```
 */
export function isValidGSTIN(gstin: unknown): boolean {
  const normalized = sanitize(gstin);
  if (normalized.length !== 15) return false;
  if (!GSTIN_REGEX.test(normalized)) return false;

  const stateCode = normalized.substring(0, 2);
  if (!(stateCode in STATE_CODE_MAP)) return false;

  return isChecksumValid(normalized);
}

/**
 * Performs a detailed, multi-step validation of a GSTIN.
 * Returns an object describing which checks passed and which failed,
 * along with human-readable error messages.
 *
 * @param gstin - Raw GSTIN input
 * @returns A `GSTINValidationResult` object
 *
 * @example
 * ```ts
 * const result = validateGSTIN('27AAPFU0939F1ZV');
 * // {
 * //   isValid: true,
 * //   formatValid: true,
 * //   lengthValid: true,
 * //   stateCodeValid: true,
 * //   panSegmentValid: true,
 * //   entityCodeValid: true,
 * //   defaultZValid: true,
 * //   checksumValid: true,
 * //   errors: []
 * // }
 * ```
 */
export function validateGSTIN(gstin: unknown): GSTINValidationResult {
  const normalized = sanitize(gstin);
  const errors: string[] = [];

  // 1. Length check
  const lengthValid = normalized.length === 15;
  if (!lengthValid) {
    errors.push(
      `GSTIN must be exactly 15 characters, received ${normalized.length}.`
    );
  }

  // 2. Overall format check
  const formatValid = GSTIN_REGEX.test(normalized);
  if (!formatValid && lengthValid) {
    errors.push('GSTIN does not match the expected format.');
  }

  // For the remaining checks we need at least 15 characters
  let stateCodeValid = false;
  let panSegmentValid = false;
  let entityCodeValid = false;
  let defaultZValid = false;
  let checksumValid = false;

  if (lengthValid) {
    // 3. State code check
    const stateCode = normalized.substring(0, 2);
    stateCodeValid = stateCode in STATE_CODE_MAP;
    if (!stateCodeValid) {
      errors.push(`"${stateCode}" is not a recognized GST state/UT code.`);
    }

    // 4. PAN segment check (characters 3–12, i.e. index 2–11)
    const panSegment = normalized.substring(2, 12);
    panSegmentValid = PAN_REGEX.test(panSegment);
    if (!panSegmentValid) {
      errors.push(
        `PAN segment "${panSegment}" does not match the expected PAN format (AAAAA9999A).`
      );
    }

    // 5. Entity code check (13th character, index 12)
    const entityCode = normalized[12];
    entityCodeValid = /^[1-9A-Z]$/.test(entityCode);
    if (!entityCodeValid) {
      errors.push(
        `Entity code "${entityCode}" is invalid. Must be 1–9 or A–Z.`
      );
    }

    // 6. Default 'Z' check (14th character, index 13)
    defaultZValid = normalized[13] === 'Z';
    if (!defaultZValid) {
      errors.push(
        `14th character must be "Z" (reserved), found "${normalized[13]}".`
      );
    }

    // 7. Checksum check (15th character, index 14)
    checksumValid = isChecksumValid(normalized);
    if (!checksumValid) {
      const expected = computeChecksum(normalized);
      errors.push(
        `Checksum character "${normalized[14]}" is invalid. Expected "${expected}".`
      );
    }
  }

  const isValid =
    lengthValid &&
    formatValid &&
    stateCodeValid &&
    panSegmentValid &&
    entityCodeValid &&
    defaultZValid &&
    checksumValid;

  return {
    isValid,
    formatValid,
    lengthValid,
    stateCodeValid,
    panSegmentValid,
    entityCodeValid,
    defaultZValid,
    checksumValid,
    errors,
  };
}

/**
 * Parses a GSTIN into its constituent parts.
 *
 * Even if the GSTIN is invalid, this function will still attempt to extract
 * whatever information it can (state code, PAN, etc.). The `isValid` field
 * tells you whether the GSTIN passed all validation checks.
 *
 * @param gstin - Raw GSTIN input
 * @returns A `GSTINParsedResult` object, or `null` if input is empty/unusable
 *
 * @example
 * ```ts
 * parseGSTIN('27AAPFU0939F1ZV');
 * // {
 * //   gstin: '27AAPFU0939F1ZV',
 * //   normalized: '27AAPFU0939F1ZV',
 * //   stateCode: '27',
 * //   stateName: 'Maharashtra',
 * //   pan: 'AAPFU0939F',
 * //   entityCode: '1',
 * //   defaultChar: 'Z',
 * //   checksum: 'V',
 * //   isValid: true
 * // }
 * ```
 */
export function parseGSTIN(gstin: unknown): GSTINParsedResult | null {
  const raw = typeof gstin === 'string' ? gstin : '';
  const normalized = sanitize(gstin);

  if (normalized.length < 15) return null;

  const stateCode = normalized.substring(0, 2);
  const stateName = getStateNameByCode(stateCode) ?? 'Unknown';
  const pan = normalized.substring(2, 12);
  const entityCode = normalized[12];
  const defaultChar = normalized[13];
  const checksum = normalized[14];
  const valid = isValidGSTIN(normalized);

  return {
    gstin: raw.trim(),
    normalized,
    stateCode,
    stateName,
    pan,
    entityCode,
    defaultChar,
    checksum,
    isValid: valid,
  };
}

/**
 * Extracts the 2-digit state code from a GSTIN.
 *
 * @param gstin - Raw GSTIN input
 * @returns The state code string, or `null` if input is too short
 *
 * @example
 * ```ts
 * getStateCodeFromGSTIN('27AAPFU0939F1ZV'); // "27"
 * ```
 */
export function getStateCodeFromGSTIN(gstin: unknown): string | null {
  const normalized = sanitize(gstin);
  if (normalized.length < 2) return null;
  return normalized.substring(0, 2);
}

/**
 * Extracts the state/UT name from a GSTIN.
 *
 * @param gstin - Raw GSTIN input
 * @returns The state name, or `null` if the code is unrecognized or input is too short
 *
 * @example
 * ```ts
 * getStateNameFromGSTIN('27AAPFU0939F1ZV'); // "Maharashtra"
 * getStateNameFromGSTIN('99XXXXX0000X1ZA'); // "Centre Jurisdiction"
 * ```
 */
export function getStateNameFromGSTIN(gstin: unknown): string | null {
  const code = getStateCodeFromGSTIN(gstin);
  if (!code) return null;
  return getStateNameByCode(code) ?? null;
}

/**
 * Extracts the PAN (characters 3–12) from a GSTIN.
 *
 * @param gstin - Raw GSTIN input
 * @returns The 10-character PAN string, or `null` if input is too short
 *
 * @example
 * ```ts
 * getPANFromGSTIN('27AAPFU0939F1ZV'); // "AAPFU0939F"
 * ```
 */
export function getPANFromGSTIN(gstin: unknown): string | null {
  const normalized = sanitize(gstin);
  if (normalized.length < 12) return null;
  return normalized.substring(2, 12);
}

/**
 * Masks the middle portion of a GSTIN for display or logging purposes.
 * Replaces characters 6–9 (0-indexed: 5–8) with asterisks.
 *
 * Format: `XXAAP****39F1ZV`  (first 5 + **** + last 6)
 *
 * @param gstin - Raw GSTIN input
 * @returns The masked GSTIN string, or `null` if input is too short
 *
 * @example
 * ```ts
 * maskGSTIN('27AAPFU0939F1ZV'); // "27AAP****39F1ZV"
 * ```
 */
export function maskGSTIN(gstin: unknown): string | null {
  const normalized = sanitize(gstin);
  if (normalized.length < 15) return null;

  const prefix = normalized.substring(0, 5);   // "27AAP"
  const suffix = normalized.substring(9, 15);  // "39F1ZV"
  return `${prefix}****${suffix}`;
}

/**
 * Checks whether a given 2-digit code is a valid GST state/UT code.
 *
 * @param code - A 2-digit state code string
 * @returns `true` if the code is recognized, `false` otherwise
 *
 * @example
 * ```ts
 * isValidStateCode('27'); // true  (Maharashtra)
 * isValidStateCode('00'); // false
 * isValidStateCode('99'); // true  (Centre Jurisdiction)
 * ```
 */
export function isValidStateCode(code: unknown): boolean {
  if (typeof code !== 'string') return false;
  const trimmed = code.trim();
  return trimmed in STATE_CODE_MAP;
}
