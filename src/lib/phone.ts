function toTenDigits(input: string): string {
	const digits = input.replace(/\D/g, "");
	return digits.length === 11 && digits.startsWith("1")
		? digits.slice(1)
		: digits;
}

/** Explains what's wrong with a phone number, or returns null if it's valid. */
export function phoneProblem(input: string): string | null {
	const digits = toTenDigits(input);
	if (digits.length === 0) return "Enter a phone number.";
	if (digits.length < 10) return `Needs 10 digits (has ${digits.length}).`;
	if (digits.length > 10)
		return "Too many digits. Use a 10-digit number like 903-555-1234.";
	if (/^[01]/.test(digits))
		return "Area codes don't start with 0 or 1. Check the first three digits.";
	if (/^[01]/.test(digits.slice(3)))
		return "The middle three digits can't start with 0 or 1.";
	return null;
}

/**
 * Accepts a US phone number in any common format ("9035561135",
 * "(903) 556-1135", "+1 903.556.1135") and returns "903-556-1135",
 * or null if it isn't a valid 10-digit US number.
 */
export function normalizePhone(input: string): string | null {
	if (phoneProblem(input)) return null;
	const ten = toTenDigits(input);
	return `${ten.slice(0, 3)}-${ten.slice(3, 6)}-${ten.slice(6)}`;
}

/** Builds a dialing link from a formatted number. */
export function phoneHref(phone: string): string {
	return `tel:+1${phone.replace(/\D/g, "")}`;
}
