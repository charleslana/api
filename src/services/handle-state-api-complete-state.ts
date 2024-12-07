import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { handleStateApiSyncState } from '@/services/handle-state-api-sync-state';

export async function handleStateApiCompleteState(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return await handleStateApiSyncState(c, method, jsonrpc, id, params, session);
}
