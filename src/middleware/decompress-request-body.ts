import * as zlib from 'zlib';
import { promisify } from 'util';
import { Context } from 'hono';

const gunzip = promisify(zlib.gunzip);

export const decompressRequestBody = async (c: Context, next: () => Promise<void>) => {
	try {
		const contentEncoding = c.req.header('content-encoding');
		if (contentEncoding && contentEncoding.includes('gzip')) {
			const clonedRequest = c.req.raw.clone();
			const bodyBuffer = await clonedRequest.arrayBuffer();
			const uncompressedBuffer = await gunzip(Buffer.from(bodyBuffer));
			const decompressedBody = uncompressedBuffer.toString();
			const newRequest = new Request(clonedRequest.url, {
				method: clonedRequest.method,
				headers: clonedRequest.headers,
				body: decompressedBody,
			});
			c.req.raw = newRequest;
		}
		await next();
	} catch (error) {
		console.error('Erro ao descompactar o corpo:', error);
		return c.json({ message: 'Erro ao processar os dados' }, 400);
	}
};
