import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import configEntries from '@/static/configEntries.js';

export async function handleConfigApiGetConfigEntriesCached(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	const gameVersion = params[0] as string;
	const abGroupsHash = params[1] as string;
	const result = {
		version: gameVersion,
		abGroupsHash: abGroupsHash,
		config: configEntries
	}
	return {
		jsonrpc,
		id,
		result: result,
	};
}
