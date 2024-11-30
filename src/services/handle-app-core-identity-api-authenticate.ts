import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { generateToken } from '@/utils/utils';

export async function handleAppCoreIdentityApiAuthenticate(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return {
		jsonrpc: jsonrpc,
		id: id,
		result: {
			resultCode: 1,
			resultMessage: 'Authenticated',
			coreUserId: 1,
			signUpToken: params[0] as string,
			authenticationToken: generateToken(),
			mergeStatus: 2,
		},
	};
}
