import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/routes/user';
import { generateToken } from '@/utils/utils';
import { returnGenericError } from '@/shared/return-generic-error';

export async function handleAppEmailAndPasswordIdentityApiAuthenticate(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const email = params[0];
		const password = params[1];
		if (!email || !password) {
			return returnGenericError(jsonrpc, id);
		}
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email));
		if (!user || user.banned) {
			return returnGenericError(jsonrpc, id);
		}
		const verifiedPassword = await verifyPassword(password, user.password);
		if (!verifiedPassword) {
			return returnGenericError(jsonrpc, id);
		}
		const signInToken = generateToken();
		const signInCount = user.signInCount + 1;
		await db
			.update(users)
			.set({
				signInCount,
				signInToken,
			})
			.where(eq(users.id, user.id)).returning();
		return returnAuthenticationToken(jsonrpc, id, user.id, params, signInToken);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

function returnAuthenticationToken(jsonrpc: string, id: number, coreUserId: number, params: any[], authenticationToken: string) {
	return {
		jsonrpc,
		id,
		result: {
			resultCode: 1,
			resultMessage: 'Authenticated',
			coreUserId,
			signUpToken: params[0],
			authenticationToken,
			mergeStatus: 2,
		},
	};
}
