import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericError } from '@/shared/return-generic-error';
import { getUserSession } from '@/services/get-user-session';
import { StateInterface } from '@/interfaces/state-interface';
import { initEmptyStateUtils } from '@/utils/init-empty-state-utils';

export async function handleStateApiSyncState(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const state = params[0] as StateInterface;
		if (!state) {
			return;
		}
		const user = await getUserSession(c, session);
		if (!user) {
			setLoggedOutState(state);
		} else {
			setLoggedInState();
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

function setLoggedOutState(state: StateInterface) {
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
	initEmptyStateUtils.progressDiff.currentGangProgress.defeatedBossIds = state.progressDiff?.currentGangProgress.defeatedBossIds ?? [];

	initEmptyStateUtils.inventoryDiff.items = state.inventoryDiff?.items ?? [];
	initEmptyStateUtils.gameStateDiff.producerStates = state.gameStateDiff?.producerStates ?? [];
	initEmptyStateUtils.gameStateDiff.cooldowns = state.gameStateDiff?.cooldowns ?? [];
	initEmptyStateUtils.gameStateDiff.reseedTimers = state.gameStateDiff?.reseedTimers ?? [];
	initEmptyStateUtils.gameStateDiff.unclaimedSeasonPassScore = state.gameStateDiff?.unclaimedSeasonPassScore ?? [];
}

function setLoggedInState() {}
