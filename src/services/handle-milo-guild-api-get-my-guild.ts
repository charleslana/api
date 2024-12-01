import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { handleMiloGuildApiGetGuild } from '@/services/handle-milo-guild-api-get-guild';

export async function handleMiloGuildApiGetMyGuild(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return handleMiloGuildApiGetGuild(c, method, jsonrpc, id, params, session);
}
