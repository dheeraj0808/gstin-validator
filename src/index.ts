/**
 * @module gstin-utils
 *
 * A lightweight, zero-dependency utility package for Indian GSTIN
 * validation, parsing, normalization, masking, and metadata extraction.
 *
 * @example
 * ```ts
 * import {
 *   isValidGSTIN,
 *   parseGSTIN,
 *   maskGSTIN,
 * } from 'gstin-utils';
 *
 * isValidGSTIN('27AAPFU0939F1ZV'); // true
 * parseGSTIN('27AAPFU0939F1ZV');   // { stateCode: '27', stateName: 'Maharashtra', ... }
 * maskGSTIN('27AAPFU0939F1ZV');    // "27AAP****39F1ZV"
 * ```
 */

// --- Core functions --------------------------------------------------------
export {
  normalizeGSTIN,
  isValidGSTIN,
  validateGSTIN,
  parseGSTIN,
  getStateCodeFromGSTIN,
  getStateNameFromGSTIN,
  getPANFromGSTIN,
  maskGSTIN,
  isValidStateCode,
} from './validator';

// --- Checksum utilities ----------------------------------------------------
export { computeChecksum, isChecksumValid } from './checksum';

// --- State code data & helpers ---------------------------------------------
export {
  STATE_CODE_MAP,
  getAllStateCodes,
  getStateNameByCode,
} from './state-codes';

// --- Types -----------------------------------------------------------------
export type { GSTINValidationResult, GSTINParsedResult } from './types';
