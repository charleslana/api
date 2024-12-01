import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';

export async function handleMiloGuildApiGetGuildJoinCooldownLeft(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return {
		jsonrpc,
		id,
		result: {
			stateUpdateOutcome: 'CLIENT_REQUEST_ACCEPTED',
			secondsLeft: 0,
		},
	};
}
