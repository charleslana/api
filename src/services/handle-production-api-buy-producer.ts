import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import {
	handleProductionApiBuyProducerMissingResources
} from '@/services/handle-production-api-buy-producer-missing-resources';

export async function handleProductionApiBuyProducer(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return await handleProductionApiBuyProducerMissingResources(c, method, jsonrpc, id, params, session);
}
