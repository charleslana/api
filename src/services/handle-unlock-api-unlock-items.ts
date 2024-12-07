import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateItemUnlockParams } from '@/interfaces/state-params';
import { ItemUnlock, User } from '@/db/model';
import { itemUnlocks } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getUserSession } from '@/services/get-user-session';

export async function handleUnlockApiUnlockItems(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return;
		}
		const state = params[0] as StateItemUnlockParams;
		if (!state || !state.progressDiff || !state.progressDiff.itemUnlockInfos || !state.progressDiff.itemUnlockInfos.length) {
			return returnGenericError(jsonrpc, id);
		}
		const promises = state.progressDiff.itemUnlockInfos.map(async (item) => {
			if (item.itemId && Number.isInteger(item.itemId)) {
				return await updateUnlockItems(c, user, item);
			}
		});
		await Promise.all(promises);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

export async function updateUnlockItems(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: ItemUnlock) {
	const db = c.get('db');
	const [existingItem] = await db
		.select()
		.from(itemUnlocks)
		.where(and(eq(itemUnlocks.userId, user.id), eq(itemUnlocks.itemId, item.itemId)));
	if (existingItem) {
		return null;
	}
	return db.insert(itemUnlocks).values({ userId: user.id, itemId: item.itemId }).returning();
}
