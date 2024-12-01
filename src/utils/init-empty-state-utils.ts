export const initEmptyStateUtils = {
	inventoryDiff: { items: [{ itemTypeId: 0, count: 0 }] },
	progressDiff: {
		xp: 0,
		level: 0,
		crashPointsEarned: 0,
		powerGems: [],
		coloredGems: [],
		relicProgress: [],
		islandUnlockInfos: [],
		buildingUnlockInfos: [],
		itemUnlockInfos: [],
		characterProgress: [],
		statueProgress: [],
		gangProgress: [],
		buildingProgress: [],
		producerProgress: [],
		tutorialProgress: [],
		liveOpProgress: {
			liveOpDragonsOrderProgress: [],
		},
		packProgress: [],
		seasonProgress: [
			{
				progressBySeason: [],
				purchasedSeasonPassProducts: [],
			},
		],
		questProgress: [],
		currentGangProgress: {
			defeatedBossIds: [0],
		},
	},
	gameStateDiff: {
		producerStates: [
			{
				producerId: 0,
				state: '',
				producingItems: [],
				produceTimeSeconds: 0,
				clientTimeStarted: 0,
			},
		],
		cooldowns: [],
		reseedTimers: [],
		unclaimedSeasonPassScore: [],
	},
};
