# gstin-utils

> A lightweight, zero-dependency utility package for Indian GSTIN validation, parsing, normalization, masking, and metadata extraction.

[![npm version](https://img.shields.io/npm/v/gstin-utils.svg)](https://www.npmjs.com/package/gstin-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## Why gstin-utils?

Working with Indian GST (Goods and Services Tax) data is a common requirement in fintech, invoicing, ERP, e-commerce, and tax-compliance applications. GSTIN numbers have a strict 15-character format with embedded state codes, PAN, entity identifiers, and a checksum — yet most codebases validate them with ad-hoc regexes that miss important checks.

**gstin-utils** gives you production-grade utilities to:

- ✅ **Validate** GSTINs with full checksum verification (Luhn mod-36)
- 🔍 **Parse** a GSTIN into state code, PAN, entity code, and more
- 🏷️ **Extract** state names, PAN numbers, and metadata
- 🔒 **Mask** GSTINs for safe display in logs or UI
- 📐 **Normalize** raw user input (trim + uppercase)
- 🗺️ **Map** all 37+ Indian state/UT codes to their names
- 🛡️ **Zero dependencies** — lightweight and secure

---

## Installation

```bash
npm install gstin-utils
```

```bash
yarn add gstin-utils
```

```bash
pnpm add gstin-utils
```

---

## Quick Start

```ts
import { isValidGSTIN, parseGSTIN, maskGSTIN } from 'gstin-utils';

// Validate
isValidGSTIN('27AAPFU0939F1ZV'); // true
isValidGSTIN('INVALIDGSTIN123'); // false

// Parse
parseGSTIN('27AAPFU0939F1ZV');
// {
//   gstin: '27AAPFU0939F1ZV',
//   stateCode: '27',
//   stateName: 'Maharashtra',
//   pan: 'AAPFU0939F',
//   entityCode: '1',
//   checksum: 'V',
//   isValid: true,
//   ...
// }

// Mask for display
maskGSTIN('27AAPFU0939F1ZV'); // "27AAP****39F1ZV"
```

---

## GSTIN Format Reference

A GSTIN is a **15-character alphanumeric** string with the following structure:

| Position | Characters | Meaning                              | Example |
| -------- | ---------- | ------------------------------------ | ------- |
| 1–2      | `27`       | State/UT code                        | `27`    |
| 3–7      | `AAPFU`    | First 5 characters of PAN (letters)  | `AAPFU` |
| 8–11     | `0939`     | Next 4 characters of PAN (digits)    | `0939`  |
| 12       | `F`        | Last character of PAN (letter)       | `F`     |
| 13       | `1`        | Entity code (1–9 or A–Z)            | `1`     |
| 14       | `Z`        | Default/reserved character           | `Z`     |
| 15       | `V`        | Checksum (computed via Luhn mod-36)  | `V`     |

---

## API Reference

### `normalizeGSTIN(gstin: unknown): string`

Trims whitespace and converts to uppercase.

```ts
normalizeGSTIN('  27aapfu0939f1zv  '); // "27AAPFU0939F1ZV"
normalizeGSTIN(null);                   // ""
```

---

### `isValidGSTIN(gstin: unknown): boolean`

Quick boolean check — validates format, state code, and checksum.

```ts
isValidGSTIN('27AAPFU0939F1ZV'); // true
isValidGSTIN('00AAPFU0939F1ZV'); // false (invalid state code)
isValidGSTIN(undefined);          // false
```

---

### `validateGSTIN(gstin: unknown): GSTINValidationResult`

Returns a detailed validation object with individual check results and error messages.

```ts
validateGSTIN('27AAPFU0939F1ZV');
// {
//   isValid: true,
//   formatValid: true,
//   lengthValid: true,
//   stateCodeValid: true,
//   panSegmentValid: true,
//   entityCodeValid: true,
//   defaultZValid: true,
//   checksumValid: true,
//   errors: []
// }

validateGSTIN('00AAPFU0939F1ZV');
// {
//   isValid: false,
//   stateCodeValid: false,
//   errors: ['"00" is not a recognized GST state/UT code.', ...]
// }
```

---

### `parseGSTIN(gstin: unknown): GSTINParsedResult | null`

Breaks down a GSTIN into its constituent parts. Returns `null` for unusable input.

```ts
parseGSTIN('27AAPFU0939F1ZV');
// {
//   gstin: '27AAPFU0939F1ZV',
//   normalized: '27AAPFU0939F1ZV',
//   stateCode: '27',
//   stateName: 'Maharashtra',
//   pan: 'AAPFU0939F',
//   entityCode: '1',
//   defaultChar: 'Z',
//   checksum: 'V',
//   isValid: true
// }
```

---

### `getStateCodeFromGSTIN(gstin: unknown): string | null`

Extracts the 2-digit state code.

```ts
getStateCodeFromGSTIN('27AAPFU0939F1ZV'); // "27"
getStateCodeFromGSTIN('');                 // null
```

---

### `getStateNameFromGSTIN(gstin: unknown): string | null`

Returns the human-readable state/UT name.

```ts
getStateNameFromGSTIN('27AAPFU0939F1ZV'); // "Maharashtra"
getStateNameFromGSTIN('07AAPFU0939F1ZV'); // "Delhi"
```

---

### `getPANFromGSTIN(gstin: unknown): string | null`

Extracts the 10-character PAN segment.

```ts
getPANFromGSTIN('27AAPFU0939F1ZV'); // "AAPFU0939F"
```

---

### `maskGSTIN(gstin: unknown): string | null`

Masks the middle portion for safe display.

```ts
maskGSTIN('27AAPFU0939F1ZV'); // "27AAP****39F1ZV"
```

---

### `isValidStateCode(code: unknown): boolean`

Validates a 2-digit GST state/UT code against the known list.

```ts
isValidStateCode('27'); // true  (Maharashtra)
isValidStateCode('00'); // false
isValidStateCode('99'); // true  (Centre Jurisdiction)
```

---

### `computeChecksum(gstin: string): string`

Computes the expected checksum character using the Luhn mod-36 algorithm.

```ts
computeChecksum('27AAPFU0939F1ZV'); // "V"
```

---

### `isChecksumValid(gstin: string): boolean`

Checks if the 15th character matches the computed checksum.

```ts
isChecksumValid('27AAPFU0939F1ZV'); // true
isChecksumValid('27AAPFU0939F1ZA'); // false
```

---

### Data Exports

```ts
import { STATE_CODE_MAP, getAllStateCodes, getStateNameByCode } from 'gstin-utils';

STATE_CODE_MAP['27'];       // "Maharashtra"
getAllStateCodes();           // ['01', '02', '03', ...]
getStateNameByCode('07');    // "Delhi"
```

---

## Edge Case Handling

All functions handle these edge cases gracefully:

| Input              | Behavior                                        |
| ------------------ | ----------------------------------------------- |
| `null`             | Returns safe default (`""`, `false`, or `null`) |
| `undefined`        | Returns safe default                            |
| `""`               | Returns safe default                            |
| `12345` (number)   | Returns safe default (non-string)               |
| `"  27aapfu...  "` | Auto-trimmed and uppercased                     |
| Short strings      | Returns `null` or validation failure            |
| Long strings       | Returns validation failure                      |

---

## State/UT Codes Supported

The package includes a complete mapping of **37+ GST state and UT codes**, including:

- All 28 Indian states
- All 8 Union Territories
- Special codes: `96` (Foreign Country), `97` (Other Territory), `99` (Centre Jurisdiction)

---

## Project Structure

```
gstin-utils/
├── src/
│   ├── index.ts          # Barrel exports
│   ├── validator.ts      # Core validation & utility functions
│   ├── checksum.ts       # Luhn mod-36 checksum algorithm
│   ├── state-codes.ts    # State/UT code mapping
│   └── types.ts          # TypeScript interfaces
├── tests/
│   └── gstin-utils.test.ts
├── examples/
│   └── usage.ts
├── package.json
├── tsconfig.json
├── jest.config.js
├── LICENSE
└── README.md
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

---

## Use Cases

- 🏦 **Fintech** — Validate merchant GSTINs during onboarding
- 🧾 **Invoicing** — Parse and display GSTIN details on invoices
- 📋 **ERP systems** — Normalize and store GSTINs consistently
- 📝 **Form validation** — Client-side or server-side GSTIN validation
- 📊 **Analytics** — Extract state-level data from GSTIN records
- 🔒 **Logging** — Mask GSTINs in logs to protect PII

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## License

[MIT](./LICENSE) © Ujjwal Pratap
