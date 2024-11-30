import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '@/utils/utils';

export async function handleAppCoreIdentityApiLogIn(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[]) {
	const db = c.get('db');
	const userSessionKey = 'guest';
	const userUpdatedSignInCount = 0;
	try {
		const signInWithToken = params[0] as string;
		if (!signInWithToken) {
			return getUserSessionKey(jsonrpc, id, userSessionKey, userUpdatedSignInCount);
		}
		console.log(signInWithToken);
		const [user] = await db.select().from(users).where(eq(users.signInToken, signInWithToken));
		if (!user || user.banned) {
			return getUserSessionKey(jsonrpc, id, userSessionKey, userUpdatedSignInCount);
		}
		const sessionKey = generateToken();
		const signInCount = user.signInCount + 1;
		await db
			.update(users)
			.set({
				signInCount,
				sessionKey,
			})
			.where(eq(users.id, user.id)).returning();
		return getUserSessionKey(jsonrpc, id, sessionKey, signInCount);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return getUserSessionKey(jsonrpc, id, userSessionKey, userUpdatedSignInCount);
	}
}

function getUserSessionKey(jsonrpc: string, id: number, sessionKey: string, signInCount: number) {
	return {
		jsonrpc,
		id,
		result: {
			resultCode: 1,
			resultMessage: 'Logged in',
			sessionKey,
			signInCount,
		},
	};
}
