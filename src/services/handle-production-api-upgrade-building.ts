import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import {
	handleProductionApiUpgradeBuildingMissingResources
} from '@/services/handle-production-api-upgrade-building-missing-resources';

export async function handleProductionApiUpgradeBuilding(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return await handleProductionApiUpgradeBuildingMissingResources(c, method, jsonrpc, id, params, session);
}
