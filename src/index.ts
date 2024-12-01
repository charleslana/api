import type { Env, Variables } from '@/lib/types';
import { dbMiddleware } from '@/db/middleware';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { appRoute } from '@/routes/app';
// import { userRoute } from '@/routes/user';
import { userAgentMiddleware } from '@/middleware/user-agent-middleware';
import { customLogger } from '@/middleware/custom-logger';
import { crashRoute } from '@/routes/crash';
// import { compress } from 'hono/compress';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// app.use(compress());
app.use(logger(customLogger));
app.use(dbMiddleware);
app.use(userAgentMiddleware);

app.get('/api', async (c) => {
	return c.redirect('/api/v1/app');
});

app.route('/api/v1/app', appRoute);
// app.route('/api/v1/user', userRoute);
app.route('/v1/c', crashRoute);

app.get('/v1/events/cotr', async (c) => {
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
