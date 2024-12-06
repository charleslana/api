import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { handleProgressApiLevelUpPlayer } from '@/services/handle-progress-api-level-up-player';

export async function handleRunnerApiEndCollectionRun(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return await handleProgressApiLevelUpPlayer(c, method, jsonrpc, id, params, session);
}
