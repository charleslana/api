import { Context } from 'hono';
import { inventories, tutorials } from '@/db/schema';
import { getUserSession } from '@/services/get-user-session';
import type { Env, Variables } from '@/lib/types';
import { and, count, eq } from 'drizzle-orm';
import { StateInventoryParams, StateTutorialParams } from '@/interfaces/state-params';
import { Inventory, User } from '@/db/model';

export async function updateInventory(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return;
		}
		const exists = await verifyTutorial(c, params, user);
		if (exists) {
			return;
		}
		if (params.length === 0) {
			return user;
		}
		const state = params[0] as StateInventoryParams;
		if (!state.inventoryDiff || !state.inventoryDiff.items || !state.inventoryDiff.items.length) {
			return user;
		}
		const promises = state.inventoryDiff.items.map(async (item) => {
			return await applyUpdateInventory(c, user, item);
		});
		const results = await Promise.all(promises);
		// return results.flat();
		return user;
	} catch (error) {
		console.error('Erro ao processar informação:', error);
		throw error;
	}
}

export async function applyUpdateInventory(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: Inventory) {
	const db = c.get('db');
	const [existingItem] = await db
		.select()
		.from(inventories)
		.where(and(eq(inventories.userId, user.id), eq(inventories.itemTypeId, item.itemTypeId)));
	if (!existingItem) {
		if (item.count > 0) {
			return db.insert(inventories).values({
				userId: user.id, itemTypeId: item.itemTypeId, count: item.count
			}).returning();
		}
	} else {
		const quantity = existingItem.count + item.count;
		if (quantity > 0) {
			return db
				.update(inventories)
				.set({
					count: quantity
				})
				.where(and(eq(inventories.userId, user.id), eq(inventories.itemTypeId, item.itemTypeId))).returning();
		} else {
			return db
				.delete(inventories)
				.where(and(eq(inventories.userId, user.id), eq(inventories.itemTypeId, item.itemTypeId)));
		}
	}
}

async function verifyTutorial(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], user: User) {
	const state = params[0] as StateTutorialParams;
	if (!state || !state.runDefinitionId) {
		return false;
	}
	const db = c.get('db');
	if (state.runDefinitionId === 'WumTurTutorial1') {
		const [countTutorial] = await db.select({ count: count() }).from(tutorials).where(eq(tutorials.userId, user.id));
		return countTutorial.count > 0;
	}
	return false;
}
