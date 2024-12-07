export interface StateInterface {
	uniqueRequestId?: string;
	inventoryDiff?: InventoryDiff;
	progressDiff?: ProgressDiff;
	gameStateDiff?: GameStateDiff;
}

interface InventoryDiff {
	items: Item[];
}

interface Item {
	itemTypeId: number;
	count: number;
}

interface ProgressDiff {
	xp: number;
	level: number;
	crashPointsEarned: number;
	powerGems: PowerGem[];
	coloredGems: any[];
	relicProgress: any[];
	islandUnlockInfos: IslandUnlockInfo[];
	buildingUnlockInfos: BuildingUnlockInfo[];
	itemUnlockInfos: any[];
	characterProgress: CharacterProgress[];
	statueProgress: any[];
	gangProgress: any[];
	buildingProgress: BuildingProgress[];
	producerProgress: ProducerProgress[];
	tutorialProgress: TutorialProgress[];
	packProgress: any[];
	seasonProgress: any[];
	questProgress: QuestProgress[];
	currentGangProgress: CurrentGangProgress;
}

interface Task {
	taskType: string;
	progress: number;
}

interface QuestProgress {
	questId: string;
	tasks: Task[];
	claimed: boolean;
}

interface PowerGem {
	islandId: number;
	numPowerGems: number;
}

interface IslandUnlockInfo {
	islandId: number;
	landUnlockInfos: [
		{
			landId: number;
			unlockedRuns: never[];
		},
	];
}

interface BuildingUnlockInfo {
	buildingId: number;
	unlockedLevel: number;
}

interface CharacterProgress {
	characterId: number;
	skinIds: number[];
}

interface BuildingProgress {
	buildingId: number;
	level: number;
}

interface ProducerProgress {
	producerId: number;
}

interface TutorialProgress {
	tutorialId: string;
}

interface CurrentGangProgress {
	defeatedBossIds: number[];
}

interface ProducingItem {
	itemTypeId: number;
	count: number;
}

interface ProducerState {
	producerId: number;
	state: string;
	producingItems: ProducingItem[];
	produceTimeSeconds: number;
	clientTimeStarted: number;
}

interface GameStateDiff {
	producerStates: ProducerState[];
	cooldowns: never[];
	reseedTimers: never[];
	unclaimedSeasonPassScore: never[];
}
