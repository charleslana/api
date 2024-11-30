import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { genericUpdateInventory } from '@/services/generic-update-inventory';

export async function adsApiEgpPurchase(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], session?: string) {
	const db = c.get('db');
	try {
		return await genericUpdateInventory(c, params, session);
	} catch (error) {
		console.error('Erro ao consultar o banco de dados:', error);
		return c.json({ error: 'Erro ao consultar os dados.' }, 500);
	}
}
