import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { handleMiloGuildApiSearchGuilds } from '@/services/handle-milo-guild-api-search-guilds';

export async function handleMiloGuildApiSuggestGuilds2(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return await handleMiloGuildApiSearchGuilds(c, method, jsonrpc, id, params, session);
}
