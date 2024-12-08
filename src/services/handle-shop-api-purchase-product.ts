import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { updateInventory } from '@/services/update-inventory';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StatePurchaseProductParams } from '@/interfaces/state-params';
import { ShopEnum } from '@/enums/shop-enum';
import { shopRotations, skins } from '@/db/schema';
import { getUserSession } from '@/services/get-user-session';
import { and, eq, inArray } from 'drizzle-orm';

interface InsertedSkin {
	characterId: number;
	skinId: number;
	userId: number;
}

export async function handleShopApiPurchaseProduct(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const state = params[0] as StatePurchaseProductParams;
		if (!state || !state.placementId) {
			return returnGenericError(jsonrpc, id);
		}
		const placementId = state.placementId as ShopEnum;
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		let shop;
		switch (placementId) {
			case ShopEnum.shop_section_free_rotatingOffers:
			case ShopEnum.free_daily_team_run_ticket:
			case ShopEnum.shop_section_teamRunTickets:
				shop = await updateShopRotation(c, placementId, user.id);
				if (shop) {
					await updateInventory(c, params, session);
				}
				return returnGenericSuccess(jsonrpc, id);
			case ShopEnum.shop_section_rotatingOffers:
				shop = await updateShopRotation(c, placementId, user.id);
				if (shop) {
					await updateInventory(c, params, session);
					await createSkins(c, state, user.id);
				}
				return returnGenericSuccess(jsonrpc, id);
			default:
				return returnGenericError(jsonrpc, id);
		}
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function createSkins(c: Context<{
	Bindings: Env, Variables: Variables
}>, state: StatePurchaseProductParams, userId: number) {
	if (!state.progressDiff || !state.progressDiff.characterProgress || !state.progressDiff.characterProgress.length) {
		return;
	}
	const skinsToInsert: InsertedSkin[] = state.progressDiff.characterProgress.flatMap((character) => (character.skinIds || []).map((skinId) => ({
		characterId: character.characterId!, skinId, userId
	})));
	if (skinsToInsert.length > 0) {
		const db = c.get('db');
		const existingSkins = await db
			.select({
				skinId: skins.skinId, userId: skins.userId
			})
			.from(skins)
			.where(and(eq(skins.userId, userId), inArray(skins.skinId, skinsToInsert.map((skin) => skin.skinId))));
		const newSkins = skinsToInsert.filter((skin) => !existingSkins.some((existing) => existing.skinId === skin.skinId && existing.userId === skin.userId));
		if (newSkins.length > 0) {
			await db.insert(skins).values(newSkins);
		}
	}
}

async function updateShopRotation(c: Context<{
	Bindings: Env, Variables: Variables
}>, placementId: string, userId: number) {
	const db = c.get('db');
	const [existingItem] = await db
		.select()
		.from(shopRotations)
		.where(and(eq(shopRotations.userId, userId), eq(shopRotations.placementId, placementId), eq(shopRotations.collected, false)));
	if (!existingItem) {
		return;
	}
	return await db
		.update(shopRotations)
		.set({
			collected: true,
		})
		.where(and(eq(shopRotations.userId, userId), eq(shopRotations.id, existingItem.id))).returning();
}
