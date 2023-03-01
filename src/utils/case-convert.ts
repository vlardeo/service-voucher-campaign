export function objectKeysFromSnakeCaseToCamelCase(o: any): unknown {
  if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function' && !(o instanceof Date)) {
    const n = {} as any;
    Object.keys(o as object).forEach((k) => {
      n[stringFromSnakeCaseToCamelCase(k)] = objectKeysFromSnakeCaseToCamelCase(o[k]);
    });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => {
      return objectKeysFromSnakeCaseToCamelCase(i);
    });
  }
  return o;
}

export function stringFromSnakeCaseToCamelCase(s: string): string {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}
