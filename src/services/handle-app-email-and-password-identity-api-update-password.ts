import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { hashPassword, verifyPassword } from '@/routes/user';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function handleAppEmailAndPasswordIdentityApiUpdatePassword(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		const password = params[0] as string;
		const newPassword = params[1] as string;
		if (!password || !newPassword) {
			return returnGenericError(jsonrpc, id);
		}
		const verifiedPassword = await verifyPassword(password, user.password);
		if (!verifiedPassword) {
			return returnGenericError(jsonrpc, id);
		}
		const passwordHash = await hashPassword(newPassword);
		await db
			.update(users)
			.set({ password: passwordHash })
			.where(eq(users.id, user.id));
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
