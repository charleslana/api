import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateBuildingUnlockParams, StateProducerParams } from '@/interfaces/state-params';
import { updateProducer } from '@/services/handle-production-api-buy-producer-missing-resources';
import { User } from '@/db/model';
import { getUserSession } from '@/services/get-user-session';
import { buildingUnlocks } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { updateBuilding } from '@/services/update-building';

export async function handleUnlockApiUnlockBuildings(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		await Promise.all([
			handleUpdateProducer(c, jsonrpc, id, params, user),
			updateBuildingUnlock(c, jsonrpc, id, params, user),
			await updateBuilding(c, params, session, user),
		]);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function handleUpdateProducer(c: Context<{
	Bindings: Env, Variables: Variables
}>, jsonrpc: string, id: number, params: any[], user: User) {
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
}

async function updateBuildingUnlock(c: Context<{
	Bindings: Env, Variables: Variables
}>, jsonrpc: string, id: number, params: any[], user: User) {
	const db = c.get('db');
	const state = params[0] as StateBuildingUnlockParams;
	if (!state.progressDiff || !state.progressDiff.buildingUnlockInfos || !state.progressDiff.buildingUnlockInfos.length) {
		return;
	}
	const promises = state.progressDiff.buildingUnlockInfos.map(async (item) => {
		const [existingItem] = await db
			.select()
			.from(buildingUnlocks)
			.where(and(eq(buildingUnlocks.userId, user.id), eq(buildingUnlocks.buildingId, item.buildingId)));
		if (item.unlockedLevel > 0) {
			if (!existingItem) {
				return db.insert(buildingUnlocks).values({
					userId: user.id, buildingId: item.buildingId, unlockedLevel: item.unlockedLevel
				}).returning();
			} else {
				return db
					.update(buildingUnlocks)
					.set({
						unlockedLevel: item.unlockedLevel,
					})
					.where(and(eq(buildingUnlocks.userId, user.id), eq(buildingUnlocks.buildingId, item.buildingId))).returning();
			}
		}
	});
	const results = await Promise.all(promises);
	return results.flat();
}
