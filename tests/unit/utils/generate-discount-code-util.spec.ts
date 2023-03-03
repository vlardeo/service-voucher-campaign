import { generateSetOfUniqDiscountCodes, generateDiscountCode } from '@/utils/generate-discount-code';

describe('@/utils/generate-discount-code', () => {
  describe('generateDiscountCode()', () => {
    it('should generate discount code with default size and prefix', () => {
      const discountCode = generateDiscountCode('');
      expect(discountCode).toBeDefined();
      expect(discountCode).toHaveLength(6);
    });

    it('should generate discount code with custom prefix and size', () => {
      const PREFIX = 'RECHARGE';

      const discountCode = generateDiscountCode('RECHARGE', 8);
      expect(discountCode).toBeDefined();

      const [prefix, code] = discountCode.split('-');
      expect(prefix).toBe(PREFIX);
      expect(code).toMatch(/[a-zA-Z]+/);
      expect(code).toHaveLength(8);
    });
  });

  describe('generateSetOfUniqDiscountCodes()', () => {
    it('should generate N uniq codes', () => {
      const codes = generateSetOfUniqDiscountCodes(1000, 'REACHARGE');
      expect(codes.size).toBe(1000);
    });

    it('should fill existing set of code with newly generated uniq codes', () => {
      const existingCodes = generateSetOfUniqDiscountCodes(100, 'REACHARGE');

      const codes = generateSetOfUniqDiscountCodes(1000, 'REACHARGE', existingCodes);
      expect(codes.size).toBe(1000);

      [...existingCodes].map((existingCode) => expect(codes.has(existingCode)).toBe(true));
    });
  });
});
