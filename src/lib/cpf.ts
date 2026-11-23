/**
 * CPF — business rules.
 *
 * The field is OPTIONAL: an empty value is always valid. The format is only
 * checked when the trainer actually types something.
 */

export const CPF_HINT = "Só preencha se for emitir recibo ou nota";
export const CPF_INVALID = "CPF inválido — confira os números.";

/** Digits only: "529.982.247-25" -> "52998224725". */
export function normalizeCpf(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/** 11 digits with valid check digits; repeated-digit sequences like 111.111.111-11 are rejected. */
export function isValidCpf(value: string | null | undefined): boolean {
  const digits = normalizeCpf(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

/**
 * Returns the error message to show, or null when the value is acceptable.
 * Empty (optional) values are acceptable; filled values must be a real CPF.
 */
export function cpfIssue(value: string | null | undefined): string | null {
  if (normalizeCpf(value) === "") return null;
  return isValidCpf(value) ? null : CPF_INVALID;
}
