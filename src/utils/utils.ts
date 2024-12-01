import { randomBytes } from 'crypto';
import validator from 'validator';

export function generateToken(): string {
	const randomData = randomBytes(36);
	const token = randomData.toString('base64');
	return token.replace(/\+/g, '_').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateNumber(): number {
	return Math.floor(Math.random() * 10_000_000_000);
}

export function validateEmail(email: string): boolean {
	return validator.isEmail(email);
}

export function validateName(name: string): boolean {
	const nameRegex = /^[\p{L}\p{N}\s]+$/u;
	return validator.matches(name, nameRegex);
}
