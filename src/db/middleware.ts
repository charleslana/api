import type { MiddlewareHandler } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

function createDb(connectionString: string) {
	const sql = neon(connectionString);
	return drizzle({ client: sql });
}

export type Database = ReturnType<typeof createDb>;

export const dbMiddleware: MiddlewareHandler = async (c, next) => {
	const db = createDb(c.env.DATABASE_URL);
	c.set('db', db);
	await next();
};
