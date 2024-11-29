import type { MiddlewareHandler } from 'hono';

export const userAgentMiddleware: MiddlewareHandler = async (c, next) => {
	const userAgent = c.req.header('user-agent');
	if (!userAgent?.includes('1.170.29')) {
		return c.json(
			{
				jsonrpc: '2.0',
				id: 0,
				error: {
					code: 1,
					message: 'Forbidden',
				},
			},
			403
		);
	}
	await next();
};
