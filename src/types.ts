/**
 * @module gstin-utils/types
 *
 * Type definitions for the gstin-utils package.
 * All return types for validation, parsing, and utility functions.
 */

/**
 * Detailed validation result returned by `validateGSTIN()`.
 * Each field represents one aspect of GSTIN validity.
 */
export interface GSTINValidationResult {
  /** Whether the GSTIN passes all validation checks */
  isValid: boolean;
  /** Whether the GSTIN matches the expected regex format */
  formatValid: boolean;
  /** Whether the GSTIN is exactly 15 characters */
  lengthValid: boolean;
  /** Whether the first two digits are a recognized GST state/UT code */
  stateCodeValid: boolean;
  /** Whether characters 3–12 form a valid PAN pattern */
  panSegmentValid: boolean;
  /** Whether the 13th character (entity code) is a valid alphanumeric digit */
  entityCodeValid: boolean;
  /** Whether the 14th character is 'Z' (default/reserved) */
  defaultZValid: boolean;
  /** Whether the 15th character (checksum) is valid per the Luhn-mod-36 algorithm */
  checksumValid: boolean;
  /** List of human-readable error messages for each failed check */
  errors: string[];
}

/**
 * Parsed GSTIN structure returned by `parseGSTIN()`.
 * Breaks down a GSTIN into its constituent parts.
 */
export interface GSTINParsedResult {
  /** The original GSTIN (as provided) */
  gstin: string;
  /** Normalized (trimmed + uppercased) GSTIN */
  normalized: string;
  /** First 2 digits — the GST state/UT code */
  stateCode: string;
  /** Human-readable state/UT name, or "Unknown" if code is not recognized */
  stateName: string;
  /** Characters 3–12 — the PAN of the entity */
  pan: string;
  /** 13th character — entity/registration number within the same PAN */
  entityCode: string;
  /** 14th character — reserved character (should be 'Z') */
  defaultChar: string;
  /** 15th character — checksum digit */
  checksum: string;
  /** Whether the GSTIN is valid (passes all checks) */
  isValid: boolean;
}
