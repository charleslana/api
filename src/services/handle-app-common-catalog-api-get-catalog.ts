import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import catalog from '@/static/catalog.js';

export async function handleAppCommonCatalogApiGetCatalog(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	const result = {
		blueprints: [],
		placements: [],
		metadata: [],
		globalScript: '',
		sdkScript: '',
		serverVariables: [],
	}
	result.blueprints = duplicate(catalog.blueprints);
	result.placements = duplicate(catalog.placements);
	return {
		jsonrpc,
		id,
		result: result,
	};
}

function duplicate (content: any) {
	return JSON.parse(JSON.stringify(content))
}
