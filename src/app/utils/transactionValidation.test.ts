import { describe, expect, it } from 'vitest';
import { isValidMemo, isValidPublicKeyAddress, normalizePublicKeyAddress } from './transactionValidation';

describe('transaction validation', () => {
  it('validates memo content and byte length', () => {
    expect(isValidMemo('')).toBe(false);
    expect(isValidMemo('hello')).toBe(true);
    expect(isValidMemo('x'.repeat(151))).toBe(false);
  });

  it('validates base64 public key addresses', () => {
    const valid = 'A'.repeat(43) + '=';
    expect(isValidPublicKeyAddress(valid)).toBe(true);
    expect(isValidPublicKeyAddress('bad')).toBe(false);
  });

  it('normalizes partial addresses', () => {
    expect(normalizePublicKeyAddress('abc')).toEqual(`${'abc'.padEnd(43, '0')}=`);
  });
});
