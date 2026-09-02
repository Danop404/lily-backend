// test/schema/quote-amount-edge-cases.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { validateQuoteAmount, QuoteAmountSchema } from '../../src/schema/quote-amount';

describe('Quote Amount Edge Cases', () => {
  describe('Valid Amounts', () => {
    it('should accept zero amount', () => {
      const result = validateQuoteAmount(0);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should accept very small positive amount', () => {
      const result = validateQuoteAmount(0.000001);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0.000001);
    });

    it('should accept maximum safe integer', () => {
      const result = validateQuoteAmount(Number.MAX_SAFE_INTEGER);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should accept large but reasonable amount', () => {
      const result = validateQuoteAmount(1_000_000_000_000); // 1 trillion
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(1_000_000_000_000);
    });
  });

  describe('Invalid Amounts', () => {
    it('should reject negative amounts', () => {
      const result = validateQuoteAmount(-1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject null', () => {
      const result = validateQuoteAmount(null as unknown as number);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject undefined', () => {
      const result = validateQuoteAmount(undefined as unknown as number);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject NaN', () => {
      const result = validateQuoteAmount(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject Infinity', () => {
      const result = validateQuoteAmount(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject non-numeric strings', () => {
      const result = validateQuoteAmount('100' as unknown as number);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject amounts exceeding max safe integer', () => {
      const result = validateQuoteAmount(Number.MAX_SAFE_INTEGER + 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    it('should validate against QuoteAmountSchema', () => {
      const validInput = 100.50;
      const { error, value } = QuoteAmountSchema.validate(validInput);
      expect(error).toBeUndefined();
      expect(value).toBe(100.50);
    });

    it('should reject invalid schema input', () => {
      const invalidInput = -50;
      const { error, value } = QuoteAmountSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(value).toBeUndefined();
    });
  });
});