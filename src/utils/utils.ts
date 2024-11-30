import { randomBytes } from 'crypto';

export function generateToken(): string {
	const randomData = randomBytes(36);
	const token = randomData.toString('base64');
	return token.replace(/\+/g, '_').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateNumber(): number {
	return Math.floor(Math.random() * 10_000_000_000);
}
