import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';

export async function handleMiloGuildApiGetCommonGuildSettings(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	// TODO Validar no cliente
	return {
		jsonrpc,
		id,
		result: {
			nameConstraints: { min: 2, max: 32 },
			descriptionConstraints: { min: 0, max: 128 },
			properties: [],
		},
	};
}
