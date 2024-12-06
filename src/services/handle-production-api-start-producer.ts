import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { handleProductionApiSpeedUpProducer } from '@/services/handle-production-api-speed-up-producer';

export async function handleProductionApiStartProducer(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return await handleProductionApiSpeedUpProducer(c, method, jsonrpc, id, params, session);
}
