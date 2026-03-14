/**
 * @module gstin-utils/state-codes
 *
 * Complete mapping of Indian GST state/UT codes to their names.
 * This includes all 28 states, 8 union territories, and special codes
 * used by the GST system.
 *
 * Reference: https://www.gst.gov.in
 */

export const STATE_CODE_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  // Special codes used by GST
  '96': 'Foreign Country',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

/**
 * Returns an array of all valid GST state codes.
 */
export function getAllStateCodes(): string[] {
  return Object.keys(STATE_CODE_MAP);
}

/**
 * Returns the full state/UT name for a given state code.
 *
 * @param code - Two-digit state code (e.g., "27")
 * @returns The state/UT name, or `undefined` if the code is invalid
 *
 * @example
 * ```ts
 * getStateNameByCode('27'); // "Maharashtra"
 * getStateNameByCode('99'); // "Centre Jurisdiction"
 * getStateNameByCode('00'); // undefined
 * ```
 */
export function getStateNameByCode(code: string): string | undefined {
  if (typeof code !== 'string') return undefined;
  return STATE_CODE_MAP[code.trim()];
}
