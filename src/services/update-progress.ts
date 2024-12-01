import { Context } from 'hono';
import { powerGems, users } from '@/db/schema';
import { getUserSession } from '@/services/get-user-session';
import type { Env, Variables } from '@/lib/types';
import { and, eq } from 'drizzle-orm';
import { StateProgressParams } from '@/interfaces/state-params';
import { PowerGem } from '@/db/model';

export async function updateProgress(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return;
		}
		if (params.length === 0) {
			return;
		}
		const state = params[0] as StateProgressParams;
		if (!state.progressDiff || !state.progressDiff.xp || !state.progressDiff.level || !state.progressDiff.crashPointsEarned) {
			return;
		}
		await db
			.update(users)
			.set({ xp: state.progressDiff.xp, level: state.progressDiff.level, crashPointsEarned: state.progressDiff.crashPointsEarned, skinId: state.skinId })
			.where(eq(users.id, user.id));
		let promises: Promise<PowerGem[] | undefined>[] = [];
		if (state.progressDiff.powerGems && state.progressDiff.powerGems.length) {
			promises = state.progressDiff.powerGems.map(async (item) => {
				const [existingItem] = await db
					.select()
					.from(powerGems)
					.where(and(eq(powerGems.userId, user.id), eq(powerGems.islandId, item.islandId)));
				if (item.numPowerGems > 0) {
					if (!existingItem) {
						return db.insert(powerGems).values({
							userId: user.id, islandId: item.islandId, numPowerGems: item.numPowerGems,
						}).returning();
					} else {
						return db
							.update(powerGems)
							.set({
								numPowerGems: existingItem.numPowerGems + item.numPowerGems,
							})
							.where(and(eq(powerGems.userId, user.id), eq(powerGems.islandId, item.islandId))).returning();
					}
				}
			});
		}
		const results = await Promise.all(promises);
		return results.flat();
	} catch (error) {
		console.error('Erro ao processar informação:', error);
		throw error;
	}
}

