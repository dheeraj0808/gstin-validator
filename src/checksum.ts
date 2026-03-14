/**
 * @module gstin-utils/checksum
 *
 * Implements the GSTIN checksum verification algorithm.
 *
 * GSTIN uses a **modified Luhn mod-36** algorithm for its 15th (check) character.
 * The algorithm maps each character of the first 14 characters to a numeric value,
 * applies a weighted computation, and derives the expected check character.
 *
 * Character set (base-36):
 *   0-9 → 0–9
 *   A-Z → 10–35
 *
 * Algorithm steps:
 *   1. For each of the first 14 characters, get its numeric value.
 *   2. Compute: factor = value × (position is odd ? 1 : 2)
 *   3. Split factor into: quotient = floor(factor / 36), remainder = factor % 36
 *   4. Sum all (quotient + remainder) values.
 *   5. Check character value = (36 - (sum % 36)) % 36
 *   6. Map check character value back to the character set.
 *
 * Reference: Government of India GST Portal documentation.
 */

/** The characters used for base-36 encoding */
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Computes the expected checksum character for a GSTIN.
 *
 * @param gstin - A 15-character GSTIN string (uppercase, no spaces)
 * @returns The expected checksum character (the 15th character)
 *
 * @example
 * ```ts
 * computeChecksum('27AAPFU0939F1ZV'); // 'V'
 * ```
 */
export function computeChecksum(gstin: string): string {
  const input = gstin.substring(0, 14);
  let sum = 0;

  for (let i = 0; i < 14; i++) {
    const char = input[i];
    const value = CHARS.indexOf(char);

    // Positions are 1-indexed: odd positions use factor 1, even use factor 2
    const factor = value * (i % 2 === 0 ? 1 : 2);
    const quotient = Math.floor(factor / 36);
    const remainder = factor % 36;

    sum += quotient + remainder;
  }

  const checkValue = (36 - (sum % 36)) % 36;
  return CHARS[checkValue];
}

/**
 * Validates whether the 15th character of a GSTIN matches
 * the computed checksum.
 *
 * @param gstin - A 15-character GSTIN string (uppercase, no spaces)
 * @returns `true` if checksum is valid, `false` otherwise
 *
 * @example
 * ```ts
 * isChecksumValid('27AAPFU0939F1ZV'); // true
 * isChecksumValid('27AAPFU0939F1ZA'); // false
 * ```
 */
export function isChecksumValid(gstin: string): boolean {
  if (typeof gstin !== 'string' || gstin.length !== 15) return false;
  const expected = computeChecksum(gstin);
  return gstin[14] === expected;
}
