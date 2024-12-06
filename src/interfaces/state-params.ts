import { Building, Inventory, Pack, PowerGem, Producer, ProducerState } from '@/db/model';

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
