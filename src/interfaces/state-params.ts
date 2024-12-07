import {
	Building, BuildingUnlock, ColoredGem, Cooldown,
	Inventory, IslandUnlockWithRuns, ItemUnlock,
	Pack,
	PowerGem,
	Producer,
	ProducerState,
	ProducerStateWithItems, Relic,
	Tutorial
} from '@/db/model';

export interface StateInventoryParams {
	inventoryDiff?: {
		items?: Inventory[];
	};
}

export interface StateCurrentAccountParams {
	name?: string;
}

export interface StateBuildingParams {
	progressDiff?: {
		buildingProgress?: Building[];
	};
}

export interface StateProgressParams {
	skinId?: number;
	progressDiff?: {
		xp?: number;
		level?: number;
		crashPointsEarned?: number;
		powerGems?: PowerGem[];
	};
}

export interface StatePostAndPollParams {
	id?: number;
	type?: number;
	headers?: any[];
	senderId?: number;
	timestampMs?: number;
	body?: string;
}

export interface StateCreateGuildParams {
	teamConfigId?: string;
	guildName?: string;
	guildDescription?: string;
	guildBadge?: number;
}

export interface StateJoinGuildParams {
	guildId?: number;
}

export interface StateSearchGuildParams {
	searchString?: string;
	minimumLevel?: number;
	filterOutOwnGuild?: boolean;
}

export interface StatePackParams {
	progressDiff?: {
		packProgress?: Pack[];
	};
}

export interface StateProducerParams {
	progressDiff?: {
		producerProgress?: Producer[];
	};
}

export interface StateProducerStateParams {
	progressDiff?: {
		producerStates?: ProducerState[];
	};
}

export interface StateGameDiffProducerStateParams {
	gameStateDiff?: {
		producerStates?: ProducerStateWithItems[];
	};
}

export interface StateTutorialParams {
	progressDiff?: {
		tutorialProgress?: Tutorial[];
	};
	runDefinitionId?: string;
}

export interface StateGangParams {
	progressDiff?: {
		currentGangProgress?: {
			defeatedBossIds?: number[];
		};
	};
}

export interface StateColoredGemParams {
	progressDiff?: {
		coloredGems?: ColoredGem[];
	};
}

export interface StateCooldownParams {
	gameStateDiff?: {
		cooldowns?: Cooldown[];
	};
}

export interface StateRelicParams {
	progressDiff?: {
		relicProgress?: Relic[];
	};
}

export interface StatePurchaseProductParams {
	placementId?: string;
	progressDiff?: {
		characterProgress?: [
			{
				characterId?: number;
				skinIds?: number[];
			}
		]
	}
}

export interface StateBuildingUnlockParams {
	progressDiff?: {
		buildingUnlockInfos?: BuildingUnlock[];
	};
}

export interface StateIslandUnlockParams {
	progressDiff?: {
		islandUnlockInfos?: IslandUnlockWithRuns[];
	};
}

export interface StateItemUnlockParams {
	progressDiff?: {
		itemUnlockInfos?: ItemUnlock[];
	};
}
