import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateIslandUnlockParams } from '@/interfaces/state-params';
import { IslandUnlockWithRuns, User } from '@/db/model';
import { getUserSession } from '@/services/get-user-session';
import { islandUnlocks, landUnlocks, unlockedRuns } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function handleUnlockApiUnlockLand(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return;
		}
		const state = params[0] as StateIslandUnlockParams;
		if (!state.progressDiff || !state.progressDiff.islandUnlockInfos || !state.progressDiff.islandUnlockInfos.length) {
			return;
		}
		const promises = state.progressDiff.islandUnlockInfos.map(async (item) => {
			return await updateUnlockLand(c, user, item);
		});
		await Promise.all(promises);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function updateUnlockLand(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: IslandUnlockWithRuns) {
	const db = c.get('db');
	const [existingState] = await db
		.select()
		.from(islandUnlocks)
		.where(and(eq(islandUnlocks.userId, user.id), eq(islandUnlocks.islandId, item.islandId)));
	let islandUnlockId;
	if (existingState) {
		islandUnlockId = existingState.id;
	} else {
		const result = await db
			.insert(islandUnlocks)
			.values({ userId: user.id, islandId: item.islandId })
			.returning();
		islandUnlockId = result[0].id;
	}
	if (!item.landUnlockInfos || !item.landUnlockInfos.length) {
		return;
	}
	const promises = item.landUnlockInfos.map(async (landUnlockInfo) => {
		const [existingLandUnlock] = await db
			.select()
			.from(landUnlocks)
			.where(
				and(
					eq(landUnlocks.islandUnlockId, islandUnlockId),
					eq(landUnlocks.landId, landUnlockInfo.landId)
				)
			);
		if (!existingLandUnlock) {
			const result = await db
				.insert(landUnlocks)
				.values({
					landId: landUnlockInfo.landId,
					islandUnlockId: islandUnlockId,
				})
				.returning();
			const landUnlockId = result[0].id;
			if (!landUnlockInfo.unlockedRuns || !landUnlockInfo.unlockedRuns.length) {
				return;
			}
			const runPromises = landUnlockInfo.unlockedRuns.map((run) =>
				db.insert(unlockedRuns).values({
					landId: run.landId,
					landUnlockId: landUnlockId,
				})
			);
			await Promise.all(runPromises);
		}
	});
	const results = await Promise.all(promises);
	return results.flat();
}
