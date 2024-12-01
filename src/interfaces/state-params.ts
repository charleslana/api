import { Building, Inventory, PowerGem } from '@/db/model';

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
