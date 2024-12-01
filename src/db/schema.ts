import {
	AnyPgColumn,
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	varchar,
	bigint
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
	signInCount: integer('signInCount').default(0).notNull(),
	banned: boolean('banned'),
	sessionKey: text('sessionKey'),
	xp: integer('xp').default(0).notNull(),
	level: integer('level').default(0).notNull(),
	crashPointsEarned: integer('crashPointsEarned').default(0).notNull(),
	skinId: integer('skinId').default(81329).notNull(),
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

export const buildingUnlocks = pgTable('buildingUnlocks', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	buildingId: integer('buildingId').notNull(),
	unlockedLevel: integer('unlockedLevel').notNull()
});

export const buildings = pgTable('buildings', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	buildingId: integer('buildingId').notNull(),
	level: integer('level').notNull()
});

export const coloredGems = pgTable('coloredGems', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	islandId: integer('islandId').notNull(),
	coloredGems: integer('coloredGems').array().notNull()
});

export const cooldowns = pgTable('cooldowns', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	cooldownId: integer('cooldownId').notNull(),
	cooldownSeconds: integer('cooldownSeconds').notNull(),
	clientTimeStarted: integer('clientTimeStarted').notNull()
});

export const gangs = pgTable('gangs', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	defeatedBossId: integer('defeatedBossId').notNull()
});

export const groupChats = pgTable('groupChats', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	guildId: integer('guildId').notNull(),
	timestampMs: bigint('timestampMs', { mode: 'number' }).notNull(),
	body: varchar('body', { length: 240 }).notNull()
});

export const guildMembers = pgTable('guildMembers', {
	id: serial('id').primaryKey(),
	userId: integer('userId').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
	guildId: integer('guildId').notNull().references(() => guilds.id, { onDelete: 'cascade' }),
	status: integer('status').notNull().default(2).notNull(),
	crashPoints: integer('crashPoints').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const guilds = pgTable('guilds', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 32 }).unique().notNull(),
	description: varchar('description', { length: 120 }).notNull(),
	badgeId: integer('badgeId').notNull(),
	isApplicationRequired: boolean('isApplicationRequired').default(false).notNull(),
	maxNumMembers: integer('maxNumMembers').default(30).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const inventories = pgTable('inventories', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	itemTypeId: integer('itemTypeId').notNull(),
	count: integer('count').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const islandUnlocks = pgTable('islandUnlocks', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	islandId: integer('islandId').notNull(),
	landId: integer('landId').notNull().references(() => landUnlocks.id, { onDelete: 'cascade' })
});

export const landUnlocks = pgTable('landUnlocks', {
	id: serial('id').primaryKey(), landId: integer('landId').notNull()
});

export const itemUnlocks = pgTable('itemUnlocks', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	itemId: integer('itemId').notNull()
});

export const packs = pgTable('packs', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	packId: integer('packId').notNull()
});

export const powerGems = pgTable('powerGems', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	islandId: integer('islandId').notNull(),
	numPowerGems: integer('numPowerGems').notNull()
});

export const producerStates = pgTable('producerStates', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	producerId: integer('producerId').notNull(),
	state: text('state').notNull(),
	produceTimeSeconds: integer('produceTimeSeconds').notNull(),
	clientTimeStarted: integer('clientTimeStarted').notNull(),
	producingItemId: integer('landId').notNull().references(() => producingItems.id, { onDelete: 'cascade' })
});

export const producingItems = pgTable('producingItems', {
	id: serial('id').primaryKey(), itemTypeId: integer('itemTypeId').notNull(), count: integer('count').notNull()
});

export const producers = pgTable('producers', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	producerId: integer('producerId').notNull()
});

export const relics = pgTable('relics', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	landId: integer('landId').notNull(),
	relicId: integer('relicId').notNull(),
	playerBestDuration: text('playerBestDuration').notNull()
});

export const shopRotations = pgTable('shopRotations', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	placementId: text('placementId').notNull(),
	blueprintId: text('blueprintId').notNull(),
	timeLeft: timestamp('timeLeft').notNull(),
	itemTypeId: integer('itemTypeId').notNull(),
	count: integer('count').notNull(),
	collected: boolean('collected').default(false).notNull()
});

export const skins = pgTable('skins', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	skinId: integer('skinId').notNull(),
	characterId: integer('characterId').notNull()
});

export const tutorials = pgTable('tutorials', {
	id: serial('id').primaryKey(),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	tutorialId: text('tutorialId').notNull()
});
