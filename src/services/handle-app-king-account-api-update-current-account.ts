import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { StateCurrentAccountParams } from '@/interfaces/state-params';
import { findUserByName } from '@/routes/user';
import { validateName } from '@/utils/utils';

export async function handleAppKingAccountApiUpdateCurrentAccount(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		const state = params[0] as StateCurrentAccountParams;
		if (!state || !state.name || state.name.trim().length < 3 || state.name.trim().length > 20 || !validateName(state.name) || user.name === state.name.trim()) {
			return returnGenericError(jsonrpc, id);
		}
		const existingName = await findUserByName(c, state.name);
		if (existingName) {
			return returnGenericError(jsonrpc, id);
		}
		await db
			.update(users)
			.set({name: state.name.trim()})
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
