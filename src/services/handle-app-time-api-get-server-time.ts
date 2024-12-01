import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';

export async function handleAppTimeApiGetServerTime(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return {
		jsonrpc,
		id,
		result: Date.now(),
	};
}
