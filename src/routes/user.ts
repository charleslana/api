import type { Env, Variables } from '@/lib/types';
import { insertUserSchema, lower, updateUserSchema, users } from '@/db/schema';
import { zValidator } from '@hono/zod-validator';
import { Context, Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { customLogger } from '@/middleware/custom-logger';

export const userRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

userRoute.get('/', async (c) => {
	const db = c.get('db');
	const allUsers = await db.select().from(users);
	return c.json(allUsers);
});

userRoute.get('/:id', zValidator('param', z.object({
	id: z.coerce.number()
})), async (c) => {
	const { id } = c.req.valid('param');
	const user = await findUser(c, id);
	if (!user) {
		return c.json({ error: 'User not found' }, 404);
	}
	return c.json({
		user: {
			id, email: user.email, name: user.name
		}
	});
});

userRoute.post('/', zValidator('json', insertUserSchema), async (c) => {
	customLogger('Request user:', `Path: ${c.req.path},`, `Body: ${JSON.stringify(c.req.valid('json'))}`, 'Response user:')
	const { email, password } = c.req.valid('json');
	const existingEmail = await findUserByEmail(c, email);
	if (existingEmail) {
		return c.json({ error: 'Email already in use' }, 400);
	}
	const name = generateUserName();
	const existingName = await findUserByName(c, name);
	if (existingName) {
		return c.json({ error: 'Name already in use' }, 400);
	}
	const db = c.get('db');
	const passwordHash = await hashPassword(password);
	const newUser = await db.insert(users).values({
		email, password: passwordHash, name
	}).returning();
	return c.json(newUser);
});

userRoute.put('/', zValidator('json', updateUserSchema), async (c) => {
	const { id, email, name, password } = c.req.valid('json');
	// TODO change id 1 mock
	const user = await findUser(c, id ?? 0);
	if (!user) {
		return c.json({ error: 'User not found' }, 404);
	}
	if (email && email.toLowerCase() !== user.email.toLowerCase()) {
		const existingEmail = await findUserByEmail(c, email);
		if (existingEmail) {
			return c.json({ error: 'Email already in use' }, 400);
		}
		user.email = email;
	}
	if (name && name.toLowerCase() !== user.name.toLowerCase()) {
		const existingName = await findUserByName(c, name);
		if (existingName) {
			return c.json({ error: 'Name already in use' }, 400);
		}
		user.name = name;
	}
	if (password) {
		user.password = await hashPassword(password);
	}
	const db = c.get('db');
	const updateUser = await db
		.update(users)
		.set(user)
		.where(eq(users.id, user.id)).returning();
	return c.json(updateUser);
});

async function findUser(c: Context<{ Bindings: Env, Variables: Variables }>, id: number) {
	const db = c.get('db');
	const [user] = await db.select().from(users).where(eq(users.id, id));
	return user;
}

export async function findUserByEmail(c: Context<{ Bindings: Env, Variables: Variables }>, email: string) {
	const db = c.get('db');
	const [user] = await db.select().from(users).where(eq(lower(users.email), email.toLowerCase()));
	return user;
}

export async function findUserByName(c: Context<{ Bindings: Env, Variables: Variables }>, name: string) {
	const db = c.get('db');
	const [user] = await db.select().from(users).where(eq(lower(users.name), name.toLowerCase()));
	return user;
}

export function generateUserName(): string {
	const randomNumbers = Math.floor(Math.random() * 10_000_000_000).toString().padStart(10, '0');
	return `Player${randomNumbers}`;
}

export async function hashPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(plainPassword, hashedPassword);
}
