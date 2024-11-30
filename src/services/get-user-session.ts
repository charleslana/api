import { Context } from 'hono';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Env, Variables } from '@/lib/types';
import { User } from '@/db/model';

export async function getUserSession(c: Context<{
	Bindings: Env,
	Variables: Variables
}>, session?: string): Promise<User | undefined> {
	const db = c.get('db');
	try {
		if (!session) {
			return;
		}
		const [user] = await db.select().from(users).where(eq(users.sessionKey, session));
		if (!user) {
			return;
		}
		return user;
	} catch (error) {
		console.error('Erro ao consultar o banco de dados:', error);
		throw error;
	}
}
