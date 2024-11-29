import {
	AnyPgColumn,
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	varchar
} from 'drizzle-orm/pg-core';
import { SQL, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: varchar('email', { length: 50 }).notNull(),
	password: text('password').notNull(),
	name: varchar('name', { length: 20 }).notNull(),
	signUpToken: text('signUpToken'),
	signInToken: text('signInToken'),
	signInCount: integer('signInCount').default(0),
	banned: boolean('banned'),
	sessionKey: text('sessionKey'),
	xp: integer('xp').default(0),
	level: integer('level').default(0),
	crashPointsEarned: integer('crashPointsEarned').default(0),
	skinId: integer('skinId').default(81329),
	guildId: integer('guildId'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
}, (table) => [[uniqueIndex('nameUniqueIndex').on(lower(table.name)), uniqueIndex('emailUniqueIndex').on(lower(table.email))]]);

export function lower(email: AnyPgColumn): SQL {
	return sql`lower(
	${email}
	)`;
}

export const insertUserSchema = createInsertSchema(users, {
	email: schema => schema.email.email(), password: schema => schema.password.min(6).max(50)
}).pick({ email: true, password: true });

export const updateUserSchema = createInsertSchema(users, {
	id: schema => schema.id.int().min(1).default(0),
	email: schema => schema.email.email().optional(),
	password: schema => schema.password.min(6).max(50).optional(),
	name: schema => schema.name.min(3).max(20).trim().optional()
}).pick({ id: true, email: true, password: true, name: true });
