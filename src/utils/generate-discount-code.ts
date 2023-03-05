const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DEFAULT_CODE_SIZE = 6;

export function generateDiscountCode(prefix: string, length = DEFAULT_CODE_SIZE) {
  let result = prefix ? `${prefix}-` : '';
  const charactersLength = LETTERS.length;
  for (let i = 0; i < length; i++) {
    result += LETTERS.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function generateSetOfUniqDiscountCodes(amount: number, prefix: string, existingCodes: Set<string> = new Set()): Set<string> {
  const uniqDiscountCodes = existingCodes.size ? new Set([...existingCodes]) : existingCodes;

  while (uniqDiscountCodes.size < amount) {
    const newCode = generateDiscountCode(prefix);
    uniqDiscountCodes.add(newCode);
  }

  return uniqDiscountCodes;
}
