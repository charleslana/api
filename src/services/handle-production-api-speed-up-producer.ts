import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateGameDiffProducerStateParams } from '@/interfaces/state-params';
import { ProducerStateWithItems, User } from '@/db/model';
import { producerStates, producingItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { updateInventory } from '@/services/update-inventory';

export async function handleProductionApiSpeedUpProducer(c: Context<{
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
			if (item.producerId && Number.isInteger(item.producerId) && item.state && Number.isInteger(item.produceTimeSeconds) && Number.isInteger(item.clientTimeStarted)) {
				return await updateProducerState(c, user, item);
			}
		});
		await Promise.all(promises);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function updateProducerState(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: ProducerStateWithItems) {
	const db = c.get('db');
	const [existingState] = await db
		.select()
		.from(producerStates)
		.where(and(eq(producerStates.userId, user.id), eq(producerStates.producerId, item.producerId)));
	let producerStateId;
	if (existingState) {
		producerStateId = existingState.id;
		await db
			.update(producerStates)
			.set({
				state: item.state,
				produceTimeSeconds: item.produceTimeSeconds,
				clientTimeStarted: item.clientTimeStarted,
			})
			.where(eq(producerStates.id, producerStateId));
	} else {
		const result = await db
			.insert(producerStates)
			.values({
				userId: user.id,
				producerId: item.producerId,
				state: item.state,
				produceTimeSeconds: item.produceTimeSeconds,
				clientTimeStarted: item.clientTimeStarted,
			})
			.returning();
		producerStateId = result[0].id;
	}
	if (!item.producingItems || !item.producingItems.length) {
		return;
	}
	const promises = item.producingItems.map(async (item) => {
		if (item.itemTypeId && Number.isInteger(item.itemTypeId) && item.count && Number.isInteger(item.count)) {
			const existingItem = await db
				.select()
				.from(producingItems)
				.where(and(eq(producingItems.producerStateId, producerStateId), eq(producingItems.itemTypeId, item.itemTypeId)));
			if (existingItem.length > 0) {
				return db
					.update(producingItems)
					.set({ count: item.count })
					.where(eq(producingItems.id, existingItem[0].id));
			} else {
				return db
					.insert(producingItems)
					.values({
						itemTypeId: item.itemTypeId,
						count: item.count,
						producerStateId: producerStateId,
					});
			}
		}
	});
	const results = await Promise.all(promises);
	return results.flat();
}
