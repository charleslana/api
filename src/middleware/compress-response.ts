import { MiddlewareHandler } from 'hono';
import { createGzip } from 'zlib';
import { Writable } from 'stream';

export const compressResponse: MiddlewareHandler = async (c, next) => {
	await next();
	const acceptEncoding = c.req.header('accept-encoding') || '';
	if (acceptEncoding.includes('gzip')) {
		const originalBody = await c.res.arrayBuffer();
		const gzip = createGzip();
		const chunks: Buffer[] = [];
		const writable = new Writable({
			write(chunk, _, callback) {
				chunks.push(chunk);
				callback();
			},
		});
		gzip.pipe(writable);
		gzip.end(Buffer.from(originalBody));
		await new Promise<void>((resolve) => writable.on('finish', resolve));
		const compressedBody = Buffer.concat(chunks);
		c.res = new Response(compressedBody, {
			status: c.res.status,
			headers: {
				...Object.fromEntries(c.res.headers),
				'Content-Encoding': 'gzip',
				'Content-Length': compressedBody.length.toString(),
				'Vary': 'Accept-Encoding',
			},
		});
	}
};
