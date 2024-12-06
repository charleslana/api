import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { updateInventory } from '@/services/update-inventory';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StatePackParams } from '@/interfaces/state-params';
import { Pack, User } from '@/db/model';
import { packs } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function handlePackApiClaimPack(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await updateInventory(c, params, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		const state = params[0] as StatePackParams;
		if (!state || !state.progressDiff || !state.progressDiff.packProgress || !state.progressDiff.packProgress.length) {
			return returnGenericError(jsonrpc, id);
		}
		const promises = state.progressDiff.packProgress.map(async (item) => {
			if (item.packId) {
				return await updatePack(c, user, item);
			}
		});
		await Promise.all(promises);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function updatePack(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: Pack) {
	const db = c.get('db');
	const [existingItem] = await db
		.select()
		.from(packs)
		.where(and(eq(packs.userId, user.id), eq(packs.packId, item.packId)));
	if (existingItem) {
		return null;
	}
	return db.insert(packs).values({ userId: user.id, packId: item.packId }).returning();
}
