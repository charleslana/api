import { Context } from 'hono';
import { inventories } from '@/db/schema';
import { genericUserSession } from '@/services/generic-user-session';
import type { Env, Variables } from '@/lib/types';
import { eq } from 'drizzle-orm';
import { StateInventoryParams } from '@/interfaces/state-params';

export async function genericUpdateInventory(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await genericUserSession(c, session);
		if (!user) {
			return;
		}
		if (params.length === 0) {
			return;
		}
		const state = params[0] as StateInventoryParams;
		if (!state.inventoryDiff || !state.inventoryDiff.items) {
			return;
		}
		const updatePromises = state.inventoryDiff.items.map((item) => {
			return db
				.update(inventories)
				.set(item)
				.where(eq(inventories.userId, user.id))
				.returning();
		});
		const results = await Promise.all(updatePromises);
		return results.flat();
	} catch (error) {
		console.error('Erro ao consultar o banco de dados:', error);
		return;
	}
}

