// test/quote-schema.test.ts
import { validateQuoteAmount } from '../src/schema/quote-schema';

describe('Quote Amount Schema Validation', () => {
  describe('Valid Amounts', () => {
    test('should accept positive amounts', () => {
      expect(validateQuoteAmount(100)).toBe(true);
      expect(validateQuoteAmount(0.01)).toBe(true);
      expect(validateQuoteAmount(999999999)).toBe(true);
    });

    test('should accept zero amount', () => {
      expect(validateQuoteAmount(0)).toBe(true);
    });
  });

  describe('Invalid Amounts', () => {
    test('should reject negative amounts', () => {
      expect(validateQuoteAmount(-1)).toBe(false);
      expect(validateQuoteAmount(-100.5)).toBe(false);
    });

    test('should reject non-numeric values', () => {
      expect(validateQuoteAmount('100' as unknown as number)).toBe(false);
      expect(validateQuoteAmount(NaN)).toBe(false);
      expect(validateQuoteAmount(Infinity)).toBe(false);
      expect(validateQuoteAmount(-Infinity)).toBe(false);
    });

    test('should reject null/undefined', () => {
      expect(validateQuoteAmount(null as unknown as number)).toBe(false);
      expect(validateQuoteAmount(undefined as unknown as number)).toBe(false);
    });

    test('should reject extremely large amounts beyond practical limits', () => {
      // Assuming max practical amount is 10^15 (1 quadrillion)
      expect(validateQuoteAmount(1e16)).toBe(false);
    });
  });
});