import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { generateNumber, generateToken } from '@/utils/utils';

export async function handleAppCoreIdentityApiSignUp(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return {
		jsonrpc,
		id,
		result: {
			resultCode: 1,
			resultMessage: 'Created account',
			coreUserId: generateNumber(),
			signUpToken: generateToken(),
		},
	};
}
