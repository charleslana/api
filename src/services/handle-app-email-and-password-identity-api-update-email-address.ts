import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { findUserByEmail, verifyPassword } from '@/routes/user';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { validateEmail } from '@/utils/utils';

export async function handleAppEmailAndPasswordIdentityApiUpdateEmailAddress(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		const email = params[1] as string;
		const password = params[2] as string;
		if (!email || !password || !validateEmail(email) || user.email.toLowerCase() === email.toLowerCase()) {
			return returnGenericError(jsonrpc, id);
		}
		const [verifiedPassword, existingEmail] = await Promise.all([
			verifyPassword(password, user.password),
			findUserByEmail(c, email),
		]);
		if (!verifiedPassword || existingEmail) {
			return returnGenericError(jsonrpc, id);
		}
		await db
			.update(users)
			.set({ email })
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
