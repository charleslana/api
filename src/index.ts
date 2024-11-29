import type { Env, Variables } from '@/lib/types';
import { dbMiddleware } from '@/db/middleware';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { appRoute } from '@/routes/app';
import { userRoute } from '@/routes/user';
import { userAgentMiddleware } from '@/middleware/user-agent-middleware';
import { customLogger } from '@/middleware/custom-logger';
// import { compress } from 'hono/compress';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// app.use(compress());
app.use(logger(customLogger));
app.use(dbMiddleware);
app.use(userAgentMiddleware);

app.get('/api', async (c) => {
	return c.redirect('/api/v1/app');
});

app.get('/api/v1/c', async (c) => {
	return c.redirect('/api/v1/app');
});

app.route('/api/v1/app', appRoute);
app.route('/api/v1/user', userRoute);

export default app;
