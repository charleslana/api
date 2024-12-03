import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { updateInventory } from '@/services/update-inventory';
import { returnGenericResponse } from '@/shared/return-generic-response';
import { returnGenericError } from '@/shared/return-generic-error';

export async function handleMiloSeasonApiSpendTeamRunTicket(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		await updateInventory(c, params, session);
		return returnGenericResponse(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
