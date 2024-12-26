import { InferSelectModel } from 'drizzle-orm';
import {
	buildings,
	buildingUnlocks,
	coloredGems,
	cooldowns,
	gangs,
	groupChats,
	guildMembers,
	guilds,
	inventories,
	islandUnlocks,
	itemUnlocks,
	landUnlocks,
	packs,
	powerGems,
	producers,
	producerStates,
	producingItems, redeems,
	relics,
	shopRotations,
	skins,
	tutorials, unlockedRuns, userRedeems,
	users
} from '@/db/schema';

export type User = InferSelectModel<typeof users>;
export type BuildingUnlock = InferSelectModel<typeof buildingUnlocks>;
export type Building = InferSelectModel<typeof buildings>;
export type ColoredGem = InferSelectModel<typeof coloredGems>;
export type Cooldown = InferSelectModel<typeof cooldowns>;
export type Gang = InferSelectModel<typeof gangs>;
export type GroupChat = InferSelectModel<typeof groupChats>;
export type GuildMember = InferSelectModel<typeof guildMembers>;
export type Guild = InferSelectModel<typeof guilds>;
export type Inventory = InferSelectModel<typeof inventories>;
export type IslandUnlock = InferSelectModel<typeof islandUnlocks>;
export type LandUnlock = InferSelectModel<typeof landUnlocks>;
export type UnLockedRun = InferSelectModel<typeof unlockedRuns>;
export type ItemUnlock = InferSelectModel<typeof itemUnlocks>;
export type Pack = InferSelectModel<typeof packs>;
export type PowerGem = InferSelectModel<typeof powerGems>;
export type ProducerState = InferSelectModel<typeof producerStates>;
export type ProducingItem = InferSelectModel<typeof producingItems>;
export type Producer = InferSelectModel<typeof producers>;
export type Relic = InferSelectModel<typeof relics>;
export type ShopRotation = InferSelectModel<typeof shopRotations>;
export type Skin = InferSelectModel<typeof skins>;
export type Tutorial = InferSelectModel<typeof tutorials>;
export type Redeem = InferSelectModel<typeof redeems>;
export type UserRedeem = InferSelectModel<typeof userRedeems>;

export type ProducerStateWithItems = ProducerState & {
	producingItems: ProducingItem[];
};

export type IslandUnlockWithRuns = IslandUnlock & {
	landUnlockInfos: (LandUnlock & {
		unlockedRuns: UnLockedRun[];
	})[];
};

