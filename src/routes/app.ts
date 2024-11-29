import type { Env, Variables } from '@/lib/types';
import { Hono } from 'hono';

export const appRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

appRoute.get('/', async (c) => {
	c.env.DATABASE_URL;
	return c.json({
		message: 'Hello World'
	});
});

appRoute.get('/redirect', async (c) => {
	return c.redirect('/api/v1/app');
});
