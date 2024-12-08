import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateGameDiffProducerStateParams } from '@/interfaces/state-params';
import { Producer, User } from '@/db/model';
import { producerStates } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { updateInventory } from '@/services/update-inventory';

export async function handleProductionApiCollectProducer(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await updateInventory(c, params, session);
		if (!user) {
			return;
		}
		const state = params[0] as StateGameDiffProducerStateParams;
		if (!state || !state.gameStateDiff || !state.gameStateDiff.producerStates || !state.gameStateDiff.producerStates.length) {
			return returnGenericError(jsonrpc, id);
		}
		const promises = state.gameStateDiff.producerStates.map(async (item) => {
			if (item.producerId && Number.isInteger(item.producerId)) {
				return await deleteProducerState(c, user, item);
			}
		});
		await Promise.all(promises);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function deleteProducerState(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: Producer) {
	const db = c.get('db');
	return db
		.delete(producerStates)
		.where(and(eq(producerStates.userId, user.id), eq(producerStates.producerId, item.producerId)));
}
