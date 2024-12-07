import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateProducerParams } from '@/interfaces/state-params';
import { Producer, User } from '@/db/model';
import { producers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { updateInventory } from '@/services/update-inventory';

export async function handleProductionApiBuyProducerMissingResources(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await updateInventory(c, params, session);
		if (!user) {
			return;
		}
		const state = params[0] as StateProducerParams;
		if (!state || !state.progressDiff || !state.progressDiff.producerProgress || !state.progressDiff.producerProgress.length) {
			return returnGenericError(jsonrpc, id);
		}
		const promises = state.progressDiff.producerProgress.map(async (item) => {
			if (item.producerId && Number.isInteger(item.producerId)) {
				return await updateProducer(c, user, item);
			}
		});
		await Promise.all(promises);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

export async function updateProducer(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: Producer) {
	const db = c.get('db');
	const [existingItem] = await db
		.select()
		.from(producers)
		.where(and(eq(producers.userId, user.id), eq(producers.producerId, item.producerId)));
	if (existingItem) {
		return null;
	}
	return db.insert(producers).values({ userId: user.id, producerId: item.producerId }).returning();
}
