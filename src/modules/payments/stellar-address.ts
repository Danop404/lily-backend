const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STELLAR_ACCOUNT_ID_VERSION_BYTE = 6 << 3;
const STELLAR_ACCOUNT_ID_DECODED_LENGTH = 35;

const decodeBase32 = (value: string): Uint8Array | undefined => {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const character of value) {
    const index = BASE32_ALPHABET.indexOf(character);

    if (index === -1) {
      return undefined;
    }

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((buffer >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  if (bits > 0 && ((buffer << (8 - bits)) & 0xff) !== 0) {
    return undefined;
  }

  return Uint8Array.from(bytes);
};

const crc16XModem = (bytes: Uint8Array): number => {
  let crc = 0;

  for (const byte of bytes) {
    crc ^= byte << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc =
        (crc & 0x8000) !== 0
          ? ((crc << 1) ^ 0x1021) & 0xffff
          : (crc << 1) & 0xffff;
    }
  }

  return crc;
};

export const isValidStellarAddress = (value: string): boolean => {
  if (!/^G[A-Z2-7]{55}$/.test(value)) {
    return false;
  }

  const decoded = decodeBase32(value);

  if (!decoded || decoded.length !== STELLAR_ACCOUNT_ID_DECODED_LENGTH) {
    return false;
  }

  const versionByte = decoded[0];

  if (versionByte !== STELLAR_ACCOUNT_ID_VERSION_BYTE) {
    return false;
  }

  const checksumStart = decoded.length - 2;
  const checksumLowByte = decoded[checksumStart];
  const checksumHighByte = decoded[checksumStart + 1];

  if (checksumLowByte === undefined || checksumHighByte === undefined) {
    return false;
  }

  const payload = decoded.subarray(0, decoded.length - 2);
  const expectedChecksum = checksumLowByte | (checksumHighByte << 8);

  return crc16XModem(payload) === expectedChecksum;
};
