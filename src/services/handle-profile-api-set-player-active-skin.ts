import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function handleProfileApiSetPlayerActiveSkin(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		const skinId = params[0] as number;
		if (!skinId) {
			return returnGenericError(jsonrpc, id);
		}
		await db
			.update(users)
			.set({ skinId })
			.where(eq(users.id, user.id));
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
