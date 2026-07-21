import { Buffer } from 'buffer';
import { describe, expect, it } from 'vitest';
import { exportPrivateKey, signTransaction } from './useAgent';

describe('private key export', () => {
  const passphrase = 'a private export test passphrase';
  const label = 'test-agent';
  const keyIndex: [number, number] = [0, 3];

  it('exports the selected key only when the passphrase derives its public key', async () => {
    const transaction = await signTransaction(
      'recipient',
      'memo',
      1,
      1,
      keyIndex,
      passphrase,
      label,
    );

    const privateKey = exportPrivateKey(
      passphrase,
      label,
      keyIndex,
      transaction.from,
    );

    expect(privateKey).not.toBeNull();
    const decodedPrivateKey = Buffer.from(privateKey!, 'base64');
    expect(decodedPrivateKey).toHaveLength(64);
    expect(decodedPrivateKey.subarray(32).toString('base64')).toBe(
      transaction.from,
    );
  });

  it('does not export a key when the expected public key does not match', () => {
    expect(
      exportPrivateKey(passphrase, label, keyIndex, 'not-the-derived-public-key'),
    ).toBeNull();
  });
});
