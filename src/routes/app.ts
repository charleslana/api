import type { Env, Variables } from '@/lib/types';
import { Hono } from 'hono';
import { userAgentMiddleware } from '@/middleware/user-agent-middleware';

export const appRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

appRoute.get('/', userAgentMiddleware, async (c) => {
	c.env.DATABASE_URL;
	return c.json({
		message: 'Hello World'
	});
});

appRoute.get('/redirect', userAgentMiddleware, async (c) => {
	return c.redirect('/api/v1/app');
});
