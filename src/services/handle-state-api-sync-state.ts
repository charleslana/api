import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericError } from '@/shared/return-generic-error';
import { getUserSession } from '@/services/get-user-session';
import { StateInterface } from '@/interfaces/state-interface';
import { initEmptyStateUtils } from '@/utils/init-empty-state-utils';
import {
	buildings, buildingUnlocks, coloredGems, cooldowns,
	gangs,
	inventories, islandUnlocks,
	itemUnlocks, landUnlocks,
	packs,
	powerGems, producers,
	producerStates, producingItems, relics,
	skins,
	tutorials, unlockedRuns
} from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { LandUnlock, ProducingItem, UnLockedRun, User } from '@/db/model';

export type LandUnlockWithRuns = LandUnlock & {
	unlockedRuns: UnLockedRun[];
};

export async function handleStateApiSyncState(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const state = params[0] as StateInterface | undefined;
		const user = await getUserSession(c, session);
		if (!user) {
			setLoggedOutState(state);
		} else {
			await setLoggedInState(c, user, state);
		}
		const result = {
			jsonrpc,
			id,
			result: {
				...initEmptyStateUtils,
				stateUpdateOutcome: 'SERVER_COMPLETE_STATE'
			},
		};
		return result;
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

function setLoggedOutState(state?: StateInterface) {
	if (!state) {
		return;
	}
	initEmptyStateUtils.progressDiff.xp = state.progressDiff?.xp ?? 0;
	initEmptyStateUtils.progressDiff.level = state.progressDiff?.level ?? 0;
	initEmptyStateUtils.progressDiff.crashPointsEarned = state.progressDiff?.crashPointsEarned ?? 0;
	initEmptyStateUtils.progressDiff.packProgress = state.progressDiff?.packProgress ?? [];
	initEmptyStateUtils.progressDiff.characterProgress = state.progressDiff?.characterProgress ?? [];
	initEmptyStateUtils.progressDiff.tutorialProgress = state.progressDiff?.tutorialProgress ?? [];
	initEmptyStateUtils.progressDiff.powerGems = state.progressDiff?.powerGems ?? [];
	initEmptyStateUtils.progressDiff.coloredGems = state.progressDiff?.coloredGems ?? [];
	initEmptyStateUtils.progressDiff.relicProgress = state.progressDiff?.relicProgress ?? [];

	initEmptyStateUtils.progressDiff.islandUnlockInfos = state.progressDiff?.islandUnlockInfos ?? [];
	initEmptyStateUtils.progressDiff.buildingUnlockInfos = state.progressDiff?.buildingUnlockInfos ?? [];
	initEmptyStateUtils.progressDiff.itemUnlockInfos = state.progressDiff?.itemUnlockInfos ?? [];
	initEmptyStateUtils.progressDiff.buildingProgress = state.progressDiff?.buildingProgress ?? [];
	initEmptyStateUtils.progressDiff.statueProgress = state.progressDiff?.statueProgress ?? [];
	initEmptyStateUtils.progressDiff.gangProgress = state.progressDiff?.gangProgress ?? [];
	initEmptyStateUtils.progressDiff.producerProgress = state.progressDiff?.producerProgress ?? [];
	initEmptyStateUtils.progressDiff.seasonProgress = state.progressDiff?.seasonProgress ?? [];
	initEmptyStateUtils.progressDiff.questProgress = state.progressDiff?.questProgress ?? [];
	initEmptyStateUtils.progressDiff.currentGangProgress = state.progressDiff?.currentGangProgress ?? {defeatedBossIds: []};

	initEmptyStateUtils.inventoryDiff.items = state.inventoryDiff?.items ?? [];
	initEmptyStateUtils.gameStateDiff.producerStates = state.gameStateDiff?.producerStates ?? [];
	initEmptyStateUtils.gameStateDiff.cooldowns = state.gameStateDiff?.cooldowns ?? [];
	initEmptyStateUtils.gameStateDiff.reseedTimers = state.gameStateDiff?.reseedTimers ?? [];
	initEmptyStateUtils.gameStateDiff.unclaimedSeasonPassScore = state.gameStateDiff?.unclaimedSeasonPassScore ?? [];
}

async function setLoggedInState(c: Context<{ Bindings: Env, Variables: Variables }>, user: User, state?: StateInterface) {
	const db = c.get('db');
	const [
		getInventories,
		getPacks,
		getSkins,
		getTutorials,
		getPowerGems,
		getGangs,
		getItemUnlocks,
		getProducerStatesWithItems,
		getBuildings,
		getBuildingUnlocks,
		getIslandUnlocksWithLandUnlocks,
		getColoredGems,
		getRelics,
		getProducers,
		getCooldowns,
	] = await Promise.all([
		db.select({itemTypeId: inventories.itemTypeId, count: inventories.count}).from(inventories).where(eq(inventories.userId, user.id)),
		db.select().from(packs).where(eq(packs.userId, user.id)),
		db.select().from(skins).where(eq(skins.userId, user.id)),
		db.select().from(tutorials).where(eq(tutorials.userId, user.id)),
		db.select({islandId: powerGems.islandId, numPowerGems: powerGems.numPowerGems}).from(powerGems).where(eq(powerGems.userId, user.id)),
		db.select().from(gangs).where(eq(gangs.userId, user.id)),
		db.select().from(itemUnlocks).where(eq(itemUnlocks.userId, user.id)),
		db.select({
				producerStates: producerStates,
				producingItems: sql<ProducingItem[]>`array_agg(json_build_object(
					'id', ${producingItems.id},
					'itemTypeId', ${producingItems.itemTypeId},
					'count', ${producingItems.count}
		))`.as('producingItems'),
		}).from(producerStates)
			.leftJoin(producingItems, eq(producerStates.id, producingItems.producerStateId))
			.where(eq(producerStates.userId, user.id))
			.groupBy(producerStates.id),
		db.select().from(buildings).where(eq(buildings.userId, user.id)),
		db.select().from(buildingUnlocks).where(eq(buildingUnlocks.userId, user.id)),
		db.select({
			islandUnlocks: islandUnlocks,
			landUnlocks: sql<LandUnlockWithRuns[]>`array_agg(
        json_build_object(
            'id', ${landUnlocks.id},
			'landId', ${landUnlocks.landId},
			'unlockedRuns', COALESCE((
			SELECT array_agg(
			json_build_object(
			'id', ${unlockedRuns.id},
			'landId', ${unlockedRuns.landId}
			)
			)
			FROM ${unlockedRuns}
			WHERE ${unlockedRuns.landUnlockId} = ${landUnlocks.id}
			), array[]::json[])
			)
			)`.as('landUnlocks'),
		}).from(islandUnlocks)
			.leftJoin(landUnlocks, eq(islandUnlocks.id, landUnlocks.islandUnlockId))
			.where(eq(islandUnlocks.userId, user.id))
			.groupBy(islandUnlocks.id),
		db.select().from(coloredGems).where(eq(coloredGems.userId, user.id)),
		db.select().from(relics).where(eq(relics.userId, user.id)),
		db.select().from(producers).where(eq(producers.userId, user.id)),
		db.select().from(cooldowns).where(eq(cooldowns.userId, user.id)),
	]);

	const groupedSkins = getSkins.reduce(
		(acc: { characterId: number; skinIds: number[] }[], skin) => {
			const characterProgress = acc.find(item => item.characterId === skin.characterId);
			if (characterProgress) {
				characterProgress.skinIds.push(skin.skinId);
			} else {
				acc.push({
					characterId: skin.characterId,
					skinIds: [skin.skinId],
				});
			}
			return acc;
		},
		[]
	);

	initEmptyStateUtils.progressDiff.xp = user.xp;
	initEmptyStateUtils.progressDiff.level = user.level;
	initEmptyStateUtils.progressDiff.crashPointsEarned = user.crashPointsEarned;
	initEmptyStateUtils.progressDiff.packProgress = getPacks;
	initEmptyStateUtils.progressDiff.characterProgress = groupedSkins;
	initEmptyStateUtils.progressDiff.tutorialProgress = getTutorials;
	initEmptyStateUtils.progressDiff.powerGems = getPowerGems;
	initEmptyStateUtils.progressDiff.coloredGems = getColoredGems;
	initEmptyStateUtils.progressDiff.relicProgress = getRelics;

	initEmptyStateUtils.progressDiff.islandUnlockInfos = getIslandUnlocksWithLandUnlocks.map(({ islandUnlocks, landUnlocks }) => ({
		islandId: islandUnlocks.islandId,
		landUnlockInfos: landUnlocks.length > 0
			? landUnlocks.map(landUnlock => ({
				id: landUnlock.id,
				landId: landUnlock.landId,
				unlockedRuns: landUnlock.unlockedRuns.length > 0
					? landUnlock.unlockedRuns
					: [],
			}))
			: [],
	}));

	initEmptyStateUtils.progressDiff.buildingUnlockInfos = getBuildingUnlocks;
	initEmptyStateUtils.progressDiff.itemUnlockInfos = getItemUnlocks;
	initEmptyStateUtils.progressDiff.buildingProgress = getBuildings;
	initEmptyStateUtils.progressDiff.statueProgress = state?.progressDiff?.statueProgress ?? [];
	initEmptyStateUtils.progressDiff.gangProgress = state?.progressDiff?.gangProgress ?? [];
	initEmptyStateUtils.progressDiff.producerProgress = getProducers;
	initEmptyStateUtils.progressDiff.seasonProgress = state?.progressDiff?.seasonProgress ?? [];
	initEmptyStateUtils.progressDiff.questProgress = state?.progressDiff?.questProgress ?? [];
	initEmptyStateUtils.progressDiff.currentGangProgress = { defeatedBossIds: getGangs.map(gang => gang.defeatedBossId) };

	initEmptyStateUtils.inventoryDiff.items = getInventories;
	initEmptyStateUtils.gameStateDiff.producerStates = getProducerStatesWithItems.map(({ producerStates, producingItems }) => ({
		producerId: producerStates.producerId,
		state: producerStates.state,
		produceTimeSeconds: producerStates.produceTimeSeconds,
		clientTimeStarted: producerStates.clientTimeStarted,
		producingItems: producingItems,
	}));
	initEmptyStateUtils.gameStateDiff.cooldowns = getCooldowns;
	initEmptyStateUtils.gameStateDiff.reseedTimers = state?.gameStateDiff?.reseedTimers ?? [];
	initEmptyStateUtils.gameStateDiff.unclaimedSeasonPassScore = state?.gameStateDiff?.unclaimedSeasonPassScore ?? [];
}
