import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { updateInventory } from '@/services/update-inventory';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { updateProgress } from '@/services/update-progress';

export async function handleProgressApiLevelUpPlayer(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await updateInventory(c, params, session);
		await updateProgress(c, params, session, user);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
