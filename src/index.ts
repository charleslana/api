import type { Env, Variables } from '@/lib/types';
import { dbMiddleware } from '@/db/middleware';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { appRoute } from '@/routes/app';
// import { userRoute } from '@/routes/user';
import { userAgentMiddleware } from '@/middleware/user-agent-middleware';
import { customLogger } from '@/middleware/custom-logger';
import { crashRoute } from '@/routes/crash';
import { decompressRequestBody } from '@/middleware/decompress-request-body';
import { publicRoute } from '@/routes/public';
// import { promisify } from 'util';
// import * as zlib from 'zlib';
// import { compressResponse } from '@/middleware/compress-response';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// const gunzip = promisify(zlib.gunzip);
// app.use('*', compressResponse);
app.use(logger(customLogger));
app.use(dbMiddleware);
app.use(userAgentMiddleware);

app.get('/api', async (c) => {
	return c.redirect('/api/v1/app');
});
const isLocal = process.env.NODE_ENV === 'local';
const apiLocal = '/v1/c/api/api';
const apiEventLocal = '/v1/events/cotr/api/api';

const apiProd = '/v1/c';
const apiEventProd = '/v1/events/cotr';

const apiBase = isLocal ? apiLocal : apiProd;
console.log('rota api', apiBase);
const apiEventBase = isLocal ? apiEventLocal : apiEventProd;
console.log('rota event', apiEventBase);

app.route('/api/v1/app', appRoute);
// app.route('/api/v1/user', userRoute);
// app.post('/v1/c/api/api', async (c) => {
// 	const bodyBuffer = await c.req.arrayBuffer();
//
// 	// Se o conteúdo estiver compactado (gzip), descompacte-o
// 	const uncompressedBuffer = await gunzip(Buffer.from(bodyBuffer));
//
// 	// Converter o buffer descompactado em JSON
// 	const body = JSON.parse(uncompressedBuffer.toString());
//
// 	// Fazer log do corpo descompactado
// 	console.log(body);
//
// 	// Retornar uma resposta
// 	return c.json({
// 		message: 'Dados recebidos com sucesso',
// 		receivedData: body
// 	});
// });
app.route(apiBase, crashRoute);
app.route('/public', publicRoute);
console.log('rota public', '/public');
app.get(apiEventBase, decompressRequestBody, async (c) => {
	return c.json({
		message: 'Ok'
	});
});

app.get('/v1/install', async (c) => {
	return c.json({
		message: 'Ok'
	});
});

app.notFound((c) => {
	return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rota Restrita</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f8f9fa;
      font-family: Arial, sans-serif;
      color: #333;
    }
    .message {
      text-align: center;
      padding: 20px;
      border: 1px solid #ccc;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .message h1 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #d9534f;
    }
    .message p {
      font-size: 16px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="message">
    <h1>Rota Restrita</h1>
    <p>Está rota está restrita ou não existe.</p>
  </div>
</body>
</html>`);
});

export default app;
