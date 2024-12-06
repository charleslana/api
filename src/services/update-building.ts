import { Context } from 'hono';
import { buildings } from '@/db/schema';
// import { getUserSession } from '@/services/get-user-session';
import type { Env, Variables } from '@/lib/types';
import { and, eq } from 'drizzle-orm';
import { StateBuildingParams } from '@/interfaces/state-params';
import { User } from '@/db/model';

export async function updateBuilding(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], session?: string, user?: User) {
	const db = c.get('db');
	try {
		if (!user) {
			return;
		}
		// const user = await getUserSession(c, session);
		// if (!user) {
		// 	return;
		// }
		if (params.length === 0) {
			return;
		}
		const state = params[0] as StateBuildingParams;
		if (!state.progressDiff || !state.progressDiff.buildingProgress || !state.progressDiff.buildingProgress.length) {
			return;
		}
		const promises = state.progressDiff.buildingProgress.map(async (item) => {
			const [existingItem] = await db
				.select()
				.from(buildings)
				.where(and(eq(buildings.userId, user.id), eq(buildings.buildingId, item.buildingId)));
			if (item.level > 0) {
				if (!existingItem) {
					return db.insert(buildings).values({
						userId: user.id, buildingId: item.buildingId, level: item.level
					}).returning();
				} else {
					return db
						.update(buildings)
						.set({
							level: item.level,
						})
						.where(and(eq(buildings.userId, user.id), eq(buildings.buildingId, item.buildingId))).returning();
				}
			}
		});
		const results = await Promise.all(promises);
		return results.flat();
	} catch (error) {
		console.error('Erro ao processar informação:', error);
		throw error;
	}
}

