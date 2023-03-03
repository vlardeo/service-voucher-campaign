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
