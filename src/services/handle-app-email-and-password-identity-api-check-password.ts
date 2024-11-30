import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { verifyPassword } from '@/routes/user';

export async function handleAppEmailAndPasswordIdentityApiCheckPassword(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		const password = params[0] as string;
		if (!params) {
			return returnGenericError(jsonrpc, id);
		}
		const hashedPassword = await verifyPassword(password, user.password);
		if (!hashedPassword) {
			return returnGenericError(jsonrpc, id);
		}
		return {
			jsonrpc,
			id,
			result: {
				resultCode: 1,
				resultMessage: 'OK',
			},
		};
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
