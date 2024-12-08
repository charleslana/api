import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { ShopRotation, User } from '@/db/model';
import { powerGems, shopRotations, skins, users } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { CostumeEnum } from '@/enums/costume-enum';
import { ShopEnum } from '@/enums/shop-enum';

interface StateShop {
	placementIds?: string[];
}

interface Placement {
	placementId: string;
	metadata: unknown[];
	products: Product[];
}

interface Product {
	blueprintId: string;
	placementId: string;
	version: string;
	priceType: string;
	internalPrices?: InternalPrice[];
	externalSku?: string;
	content: Content[];
	display: Display[];
	metadata: unknown[];
}

interface InternalPrice {
	itemTypeId: number;
	count: number;
}

interface Content {
	itemTypeId: number;
	count: number;
	payload: string;
}

interface Display {
	key: string;
	value?: string;
	display?: unknown[];
}

export async function handleShopApiLoadProducts(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		const state = params[0] as StateShop;
		if (!state || !state.placementIds) {
			return returnGenericError(jsonrpc, id);
		}
		const requestedIDs = state.placementIds;
		const placements: Placement[] = await buildPlacements(requestedIDs, c, user);
		const response = buildResponse(jsonrpc, id, placements);
		return response;
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function buildPlacements(requestedIDs: string[], c: Context<{
	Bindings: Env, Variables: Variables
}>, user?: User) {
	const placements: Placement[] = [];
	for (const id of requestedIDs) {
		const placement = createPlacement(id);
		await addProductsToPlacement(id, placement, c, user);
		placements.push(placement);
	}
	return placements;
}

function createPlacement(id: string) {
	return {
		placementId: id, metadata: [], products: []
	};
}

async function addProductsToPlacement(id: string, placement: Placement, c: Context<{
	Bindings: Env, Variables: Variables
}>, user?: User): Promise<void> {
	switch (id) {
		case 'shop_section_teamRunTickets':
			placement.products.push(createRunTicketSmall(id));
			placement.products.push(createRunTicketMedium(id));
			placement.products.push(createRunTicketLarge(id));
			break;
		case 'shop_section_free_rotatingOffers':
			placement.products.push(await createFreeRotatingOffers(id, c, user));
			break;
		case 'shop_section_purpleCrystals':
			placement.products.push(createPurpleCrystalsPile(id));
			placement.products.push(createPurpleCrystalsPouch(id));
			placement.products.push(createPurpleCrystalsCrate(id));
			placement.products.push(createPurpleCrystalsBarrel(id));
			placement.products.push(createPurpleCrystalsMinecart(id));
			placement.products.push(createPurpleCrystalsVault(id));
			break;
		case 'free_daily_team_run_ticket':
			placement.products.push(await createFreeDailyTeamRunTicket(id, c, user));
			break;
		case 'shop_section_rotatingOffers':
			placement.products.push(await createSectionRotatingOffers(id, c, user));
			break;
	}
}

function createRunTicketSmall(id: string) {
	return createTeamRunTicketProduct(id, 'shop_teamRunTicket_1', 10, 1, 'Shop.OfferName.TeamRunTicketsSmall');
}

function createRunTicketMedium(id: string) {
	return createTeamRunTicketProduct(id, 'shop_teamRunTicket_2', 25, 3, 'Shop.OfferName.TeamRunTicketsMedium');
}

function createRunTicketLarge(id: string) {
	return createTeamRunTicketProduct(id, 'shop_teamRunTicket_3', 40, 5, 'Shop.OfferName.TeamRunTicketsLarge');
}

function createTeamRunTicketProduct(placementId: string, blueprintId: string, internalPriceCount: number, contentCount: number, displayName: string) {
	return {
		blueprintId,
		placementId,
		version: '0',
		priceType: 'INTERNAL',
		internalPrices: [{ itemTypeId: 81000, count: internalPriceCount }],
		content: [{
			itemTypeId: 81381, count: contentCount, payload: ''
		}],
		display: [{
			key: 'name', value: displayName
		}],
		metadata: []
	};
}

async function createFreeRotatingOffers(placementId: string, c: Context<{
	Bindings: Env, Variables: Variables
}>, user?: User) {
	if (!user) {
		return emptyResponseFreeRotationOffers(placementId);
	}
	const model = {} as ShopRotation;
	model.userId = user.id;
	model.placementId = placementId;
	await deleteShop(c, user, model);
	const shopRotation = await createShopCreateFreeRotatingOffers(placementId, user.id, c);
	return responseFreeRotationOffers(shopRotation!);
}

function emptyResponseFreeRotationOffers(placementId: string) {
	const model = {} as ShopRotation;
	model.itemTypeId = 81026;
	model.placementId = placementId;
	model.blueprintId = 'shop_free_rotating_offer';
	model.count = 0;
	model.collected = true;
	return responseFreeRotationOffers(model);
}

function responseFreeRotationOffers(shopRotation: ShopRotation) {
	const timeLeft = getTimeLeftUntil();
	return {
		blueprintId: shopRotation.blueprintId,
		placementId: shopRotation.placementId,
		version: '0',
		priceType: 'NONE',
		content: [{ itemTypeId: shopRotation.itemTypeId, count: shopRotation.count, payload: '' }],
		display: [{ key: 'badge', value: 'Offers.Value.Popular' }],
		metadata: [{ key: 'candidateId', value: 'variant_17' }, {
			key: 'timeLeft', value: timeLeft
		}, { key: 'purchasesLeft', value: shopRotation.collected ? '0' : '1' }, { key: 'maxPurchases', value: '1' }]
	};
}

function getTimeLeftUntil() {
	return 3600 * 3600;
}

async function deleteShop(c: Context<{ Bindings: Env, Variables: Variables }>, user: User, item: ShopRotation) {
	if (!Object.values(ShopEnum).includes(item.placementId as ShopEnum)) {
		return;
	}
	const db = c.get('db');
	const [exists] = await db
		.select()
		.from(shopRotations)
		.where(and(eq(shopRotations.userId, user.id), eq(shopRotations.placementId, item.placementId)));
	const currentDate = new Date();
	if (exists && exists.timeLeft <= currentDate && exists.placementId === item.placementId && exists.collected) {
		await db
			.delete(shopRotations)
			.where(and(eq(shopRotations.userId, user.id), eq(shopRotations.id, exists.id)));
	}
}

async function createShopCreateFreeRotatingOffers(placementId: string, userId: number, c: Context<{
	Bindings: Env, Variables: Variables
}>) {
	const model = {} as ShopRotation;
	const powerGems = await getTotalPowerGemsByUserId(c, userId);
	const [item, count] = getRandomItem(powerGems);
	model.itemTypeId = item;
	model.count = count;
	model.placementId = placementId;
	model.blueprintId = 'shop_free_rotating_offer';
	model.userId = userId;
	return await createShop(c, userId, model);
}

async function getTotalPowerGemsByUserId(c: Context<{ Bindings: Env, Variables: Variables }>, userId: number) {
	const db = c.get('db');
	const [result] = await db
		.select({
			totalPowerGems: sql<number>`
				(SELECT COALESCE(SUM("numPowerGems"), 0)
				 FROM ${powerGems}
				 WHERE ${powerGems}."userId" = ${users.id})
			`
		})
		.from(users)
		.where(eq(users.id, userId))
		.groupBy(users.id);
	return result.totalPowerGems;
}

function getRandomItem(powerGems: number): [number, number] {
	const items: number[] = [81000, 81006, 81007, 81026, 81027, 81028];
	if (powerGems >= 8) {
		items.push(81011, 81030, 81031);
	}
	if (powerGems >= 16) {
		items.push(81012);
	}
	const randomIndex = Math.floor(Math.random() * items.length);
	const item = items[randomIndex];
	const specialItems = [81000, 81026];
	const maxValue = specialItems.includes(item) ? 250 : 5;
	const count = Math.floor(Math.random() * maxValue) + 1;
	return [item, count];
}

async function createShop(c: Context<{ Bindings: Env, Variables: Variables }>, userId: number, item: ShopRotation) {
	if (!Object.values(ShopEnum).includes(item.placementId as ShopEnum)) {
		return;
	}
	const db = c.get('db');
	const [exists] = await db
		.select()
		.from(shopRotations)
		.where(and(eq(shopRotations.userId, userId), eq(shopRotations.placementId, item.placementId)));
	if (exists) {
		return exists;
	}
	const now = new Date();
	const newDate = new Date(now.getTime() + 60 * 60 * 1000);
	item.timeLeft = newDate;
	const [created] = await db.insert(shopRotations).values(item).returning();
	return created;
}

function createPurpleCrystalsPile(placementId: string) {
	return {
		blueprintId: 'purple-crystals-the-pile',
		placementId: placementId,
		version: '0',
		priceType: 'EXTERNAL',
		externalSku: 'com.king.crash.purple_crystals_the_pile',
		content: [{ itemTypeId: 81000, count: 45, payload: '' }],
		display: [{ key: 'name', value: 'Shop.OfferName.Pile' }, { key: 'icon', value: 'ui/bank/pile' }],
		metadata: [{ key: 'purchasesLeft', value: '0' }]
	};
}

function createPurpleCrystalsPouch(placementId: string) {
	return {
		blueprintId: 'purple-crystals-the-pouch',
		placementId: placementId,
		version: '0',
		priceType: 'EXTERNAL',
		externalSku: 'com.king.crash.purple_crystals_the_pouch',
		content: [{ itemTypeId: 81000, count: 120, payload: '' }],
		display: [{ key: 'name', value: 'Shop.OfferName.Pouch' }, { key: 'icon', value: 'ui/bank/pouch' }],
		metadata: [{ key: 'purchasesLeft', value: '0' }]
	};
}

function createPurpleCrystalsCrate(placementId: string) {
	return {
		blueprintId: 'purple-crystals-the-crate',
		placementId: placementId,
		version: '0',
		priceType: 'EXTERNAL',
		externalSku: 'com.king.crash.purple_crystals_the_crate',
		content: [{ itemTypeId: 81000, count: 250, payload: '' }],
		display: [{ key: 'name', value: 'Shop.OfferName.Crate' }, { key: 'icon', value: 'ui/bank/crate' }],
		metadata: [{ key: 'purchasesLeft', value: '0' }]
	};
}

function createPurpleCrystalsBarrel(placementId: string) {
	return {
		blueprintId: 'purple-crystals-the-barrel',
		placementId: placementId,
		version: '0',
		priceType: 'EXTERNAL',
		externalSku: 'com.king.crash.purple_crystals_the_barrel',
		content: [{ itemTypeId: 81000, count: 530, payload: '' }],
		display: [{ key: 'name', value: 'Shop.OfferName.Barrel' }, { key: 'icon', value: 'ui/bank/barrel' }],
		metadata: [{ key: 'purchasesLeft', value: '0' }]
	};
}

function createPurpleCrystalsMinecart(placementId: string) {
	return {
		blueprintId: 'purple-crystals-the-minecart',
		placementId: placementId,
		version: '0',
		priceType: 'EXTERNAL',
		externalSku: 'com.king.crash.purple_crystals_the_minecart',
		content: [{ itemTypeId: 81000, count: 1150, payload: '' }],
		display: [{ key: 'name', value: 'Shop.OfferName.MineCart' }, { key: 'icon', value: 'ui/bank/minecart' }],
		metadata: [{ key: 'purchasesLeft', value: '0' }]
	};
}

function createPurpleCrystalsVault(placementId: string) {
	return {
		blueprintId: 'purple-crystals-the-vault',
		placementId: placementId,
		version: '0',
		priceType: 'EXTERNAL',
		externalSku: 'com.king.crash.purple_crystals_the_vault',
		content: [{ itemTypeId: 81000, count: 3250, payload: '' }],
		display: [{ key: 'name', value: 'Shop.OfferName.Vault' }, { key: 'icon', value: 'ui/bank/vault' }],
		metadata: [{ key: 'purchasesLeft', value: '0' }]
	};
}

async function createFreeDailyTeamRunTicket(placementId: string, c: Context<{
	Bindings: Env, Variables: Variables
}>, user?: User) {
	if (!user) {
		return emptyResponseFreeDailyTeamRunTicket(placementId);
	}
	const model = {} as ShopRotation;
	model.userId = user.id;
	model.placementId = placementId;
	await deleteShop(c, user, model);
	const shopRotation = await createShopFreeDailyTeamRunTicket(placementId, user.id, c);
	return responseFreeDailyTeamRunTicket(shopRotation!);
}

function emptyResponseFreeDailyTeamRunTicket(placementId: string) {
	const model = {} as ShopRotation;
	model.placementId = placementId;
	model.collected = true;
	return responseFreeDailyTeamRunTicket(model);
}

function responseFreeDailyTeamRunTicket(shopRotation: ShopRotation) {
	const timeLeft = getTimeLeftUntil();
	return {
		blueprintId: 'daily_free_ticket',
		placementId: shopRotation.placementId,
		version: '0',
		priceType: 'NONE',
		content: [{ itemTypeId: 81381, count: 1, payload: '' }],
		display: [],
		metadata: [{ key: 'softCap', value: '10' }, {
			key: 'transactionContext', value: 'claimTicket'
		}, { key: 'gameFeature', value: 'MILO_SEASON_TEAM_RUN_TICKET' }, {
			key: 'timeLeft', value: timeLeft
		}, { key: 'purchasesLeft', value: shopRotation.collected ? '0' : '1' }, { key: 'maxPurchases', value: '1' }]
	};
}

async function createShopFreeDailyTeamRunTicket(placementId: string, userId: number, c: Context<{
	Bindings: Env, Variables: Variables
}>) {
	const model = {} as ShopRotation;
	model.itemTypeId = 81381;
	model.count = 1;
	model.placementId = placementId;
	model.blueprintId = 'shop_free_rotating_offer';
	model.userId = userId;
	return await createShop(c, userId, model);
}

async function createSectionRotatingOffers(placementId: string, c: Context<{
	Bindings: Env, Variables: Variables
}>, user?: User) {
	if (!user) {
		return emptyResponseSectionRotationOffers(placementId);
	}
	const model = {} as ShopRotation;
	model.userId = user.id;
	model.placementId = placementId;
	await deleteShop(c, user, model);
	const shopRotation = await createShopSectionRotatingOffers(placementId, user.id, c);
	if (shopRotation) {
		return responseSectionRotationOffers(shopRotation);
	}
	return emptyResponseSectionRotationOffers(placementId);
}

function emptyResponseSectionRotationOffers(placementId: string) {
	const model = {} as ShopRotation;
	model.itemTypeId = 81605;
	model.placementId = placementId;
	model.blueprintId = 'shop_daily_rotating_skin_MiloCostumeCocoWumpaSkin';
	model.count = 60;
	model.collected = true;
	return responseSectionRotationOffers(model);
}

function responseSectionRotationOffers(shopRotation: ShopRotation) {
	return {
		blueprintId: shopRotation.blueprintId,
		placementId: shopRotation.placementId,
		version: '0',
		priceType: 'INTERNAL',
		internalPrices: [{ itemTypeId: 81000, count: shopRotation.count }],
		content: [{ itemTypeId: shopRotation.itemTypeId, count: 1, payload: '' }],
		display: [],
		metadata: [{ key: 'purchasesLeft', value: shopRotation.collected ? '0' : '1' }, {
			key: 'maxPurchases', value: '1'
		}]
	};
}

async function createShopSectionRotatingOffers(placementId: string, userId: number, c: Context<{
	Bindings: Env, Variables: Variables
}>) {
	const allSkins = Object.entries(CostumeEnum).filter(([, value]) => typeof value === 'number') as [string, number][];
	const mySkins = await getAllSkinsByUserId(c, userId);
	const ownedSkinIds = mySkins.map(skin => skin.skinId);
	const availableSkins = allSkins.filter(([, id]) => !ownedSkinIds.includes(id));
	if (availableSkins.length === 0) {
		return null;
	}
	const randomIndex = Math.floor(Math.random() * availableSkins.length);
	const [name, id] = availableSkins[randomIndex];
	const model = {} as ShopRotation;
	model.itemTypeId = id;
	model.count = 60;
	model.placementId = placementId;
	model.blueprintId = `shop_daily_rotating_skin_${name}`;
	model.userId = userId;
	return await createShop(c, userId, model);
}

async function getAllSkinsByUserId(c: Context<{ Bindings: Env, Variables: Variables }>, userId: number) {
	const db = c.get('db');
	const exists = await db.select().from(skins).where(eq(skins.userId, userId));
	return exists;
}

function buildResponse(jsonrpc: string, id: number, placements: Placement[]) {
	const response = {
		jsonrpc,
		id,
		result: {
			placements
		}
	};
	return response;
}
