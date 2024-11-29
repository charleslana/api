import { Context } from 'hono';
import { users } from '@/db/schema';

export async function trackingApiGetUniqueACId(c: Context) {
	const db = c.get('db');
	try {
		return await db.select().from(users);
	} catch (error) {
		console.error('Erro ao consultar o banco de dados:', error);
		return c.json({ error: 'Erro ao consultar os dados.' }, 500);
	}
}
