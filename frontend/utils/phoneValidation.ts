const TZ_PHONE_PATTERN = /^(\+255|0)[67]\d{8}$/;

export function isValidTzPhone(phone: string): boolean {
  const normalized = phone.replace(/\s/g, "");
  return TZ_PHONE_PATTERN.test(normalized);
}

export function normalizeTzPhone(phone: string): string {
  const trimmed = phone.replace(/\s/g, "");
  if (trimmed.startsWith("0")) {
    return `+255${trimmed.slice(1)}`;
  }
  return trimmed;
}
