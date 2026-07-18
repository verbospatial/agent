export const MAX_MEMO_BYTES = 150;

const publicKeyAddressPattern = /^[A-Za-z0-9/+]{43}=$/;

export const getUtf8ByteLength = (value: string) =>
  new TextEncoder().encode(value).length;

export const isValidPublicKeyAddress = (value: string) =>
  publicKeyAddressPattern.test(value);

export const normalizePublicKeyAddress = (value: string) =>
  `${value.replace(/[^A-Za-z0-9/+]/gi, '').padEnd(43, '0').slice(0, 43)}=`;

export const isValidMemo = (value: string, maxBytes = MAX_MEMO_BYTES) =>
  value.trim().length > 0 && getUtf8ByteLength(value) <= maxBytes;

export const isValidSpatialMemo = (value: string) => isValidMemo(value);
