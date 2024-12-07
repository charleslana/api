import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { handleUnlockApiUnlockLand } from '@/services/handle-unlock-api-unlock-land';

export async function handleUnlockApiUnlockIsland(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return await handleUnlockApiUnlockLand(c, method, jsonrpc, id, params, session);
}
