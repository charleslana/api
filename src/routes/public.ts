import type { Env, Variables } from '@/lib/types';
import { Hono } from 'hono';
import { clientAuthMiddleware } from '@/middleware/client-auth-middleware';
import { guildMembers, guilds, inventories, powerGems, redeems, skins, userRedeems, users } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { applyUpdateInventory } from '@/services/update-inventory';
import { StatePurchaseProductParams } from '@/interfaces/state-params';
import { createSkins } from '@/services/handle-shop-api-purchase-product';

export const publicRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

publicRoute.get('/player/top-rich', clientAuthMiddleware, async (c) => {
	const db = c.get('db');
	try {
		const topPlayers = await db
			.select({
				name: users.name,
				purpleCrystals: inventories.count
			})
			.from(inventories)
			.innerJoin(users, eq(inventories.userId, users.id))
			.where(eq(inventories.itemTypeId, 81000))
			.orderBy(sql`${inventories.count}
			DESC`)
			.limit(100);
		return c.json(topPlayers);
	} catch (error) {
		console.error('Error fetching top players:', error);
		return c.json({
			error: true,
			message: 'Failed to fetch top players'
		}, 500);
	}
});

publicRoute.get('/player/top-skins', clientAuthMiddleware, async (c) => {
	const db = c.get('db');
	try {
		const topPlayers = await db
			.select({
				name: users.name,
				totalSkins: sql`COUNT(
				${skins.id}
				)`
			})
			.from(skins)
			.innerJoin(users, eq(skins.userId, users.id))
			.groupBy(skins.userId, users.name)
			.orderBy(sql`COUNT(
			${skins.id}
			)
			DESC`)
			.limit(100);
		return c.json(topPlayers);
	} catch (error) {
		console.error('Error fetching top players:', error);
		return c.json({
			error: true,
			message: 'Failed to fetch top players'
		}, 500);
	}
});

publicRoute.get('/player/top-level', clientAuthMiddleware, async (c) => {
	const db = c.get('db');
	try {
		const topPlayers = await db
			.select({
				name: users.name,
				level: users.level
			})
			.from(users)
			.orderBy(sql`${users.level}
			DESC`)
			.limit(100);
		return c.json(topPlayers);
	} catch (error) {
		console.error('Error fetching top players:', error);
		return c.json({
			error: true,
			message: 'Failed to fetch top players'
		}, 500);
	}
});

publicRoute.get('/player/top-power-gems', clientAuthMiddleware, async (c) => {
	const db = c.get('db');
	try {
		const topPlayers = await db
			.select({
				name: users.name,
				totalPowerGems: sql`SUM(
				${powerGems.numPowerGems}
				)`
			})
			.from(powerGems)
			.innerJoin(users, eq(powerGems.userId, users.id))
			.groupBy(powerGems.userId, users.name)
			.orderBy(sql`SUM(
			${powerGems.numPowerGems}
			)
			DESC`)
			.limit(100);
		return c.json(topPlayers);
	} catch (error) {
		console.error('Error fetching top players:', error);
		return c.json({
			error: true,
			message: 'Failed to fetch top players'
		}, 500);
	}
});

publicRoute.get('/player/top-points', clientAuthMiddleware, async (c) => {
	const db = c.get('db');
	try {
		const topPlayers = await db
			.select({
				name: users.name,
				crashPointsEarned: users.crashPointsEarned
			})
			.from(users)
			.orderBy(sql`${users.crashPointsEarned}
			DESC`)
			.limit(100);
		return c.json(topPlayers);
	} catch (error) {
		console.error('Error fetching top players:', error);
		return c.json({
			error: true,
			message: 'Failed to fetch top players'
		}, 500);
	}
});

publicRoute.get('/player/top-duration', clientAuthMiddleware, async (c) => {
	const db = c.get('db');
	try {
		const topPlayers = await db
			.select({
				name: users.name,
				runDuration: users.runDuration
			})
			.from(users)
			.orderBy(sql`${users.runDuration}
			DESC NULLS LAST`)
			.limit(100);
		return c.json(topPlayers);
	} catch (error) {
		console.error('Error fetching top players:', error);
		return c.json({
			error: true,
			message: 'Failed to fetch top players'
		}, 500);
	}
});

publicRoute.get('/guild/top-trophies', clientAuthMiddleware, async (c) => {
	const db = c.get('db');
	try {
		const topGuilds = await db
			.select({
				guild: guilds,
				totalCrashPoints: sql<number>`SUM(
				${users.crashPointsEarned}
				)`.as('totalCrashPoints'),
				totalMembers: sql<number>`COUNT(
				${guildMembers.id}
				)`.as('totalMembers'),
				leaderId: sql<number>`
					(SELECT "userId" FROM ${guildMembers} AS gm WHERE gm."guildId" = ${guilds.id} AND gm."status" = 2 LIMIT 1)
				`.as('leaderId')
			})
			.from(guilds)
			.leftJoin(guildMembers, eq(guilds.id, guildMembers.guildId))
			.leftJoin(users, eq(guildMembers.userId, users.id))
			.groupBy(guilds.id)
			.orderBy(sql<number>`SUM(
			${users.crashPointsEarned}
			)
			DESC`)
			.limit(100);
		const guildDetails = await Promise.all(topGuilds.map(async (guild) => {
			const leaderName = await db
				.select({
					name: users.name
				})
				.from(users)
				.where(eq(users.id, guild.leaderId))
				.limit(1)
				.then((res) => res[0]?.name || 'Unknown');
			return {
				guildName: guild.guild.name,
				totalTrophies: guild.totalCrashPoints.toString(),
				totalMembers: guild.totalMembers,
				leaderName: leaderName
			};
		}));
		return c.json(guildDetails);
	} catch (error) {
		console.error('Error fetching top guilds by trophies:', error);
		return c.json({
			error: true,
			message: 'Failed to fetch top guilds'
		}, 500);
	}
});

publicRoute.post('/player/redeem', clientAuthMiddleware, zValidator('json', z.object({
	email: z.string().email(), code: z.string().trim().min(1)
})), async (c) => {
	const db = c.get('db');
	const { email, code } = c.req.valid('json');
	try {
		const [redeem] = await db.select().from(redeems).where(eq(redeems.code, code));
		if (!redeem) {
			return c.json({
				error: true,
				message: 'Código inválido ou não encontrado'
			}, 404);
		}
		if (redeem.expiration && new Date(redeem.expiration) < new Date()) {
			return c.json({
				error: true,
				message: 'Este código expirou'
			}, 400);
		}
		if (redeem.limit !== null && redeem.limit > 0) {
			const [redeemCount] = await db
				.select({ count: sql<number>`COUNT(*)`.as('count') })
				.from(userRedeems)
				.where(eq(userRedeems.redeemId, redeem.id));
			if (redeemCount.count >= redeem.limit) {
				return c.json({
					error: true,
					message: 'O limite de resgates para este código foi atingido'
				}, 400);
			}
		}
		const [user] = await db.select().from(users).where(eq(users.email, email));
		if (!user) {
			return c.json({
				error: true,
				message: 'Este código não existe para o usuário'
			}, 404);
		}
		const [userRedeem] = await db.select().from(userRedeems)
			.where(and(eq(userRedeems.userId, user.id), eq(userRedeems.redeemId, redeem.id)));
		if (userRedeem) {
			return c.json({
				error: true,
				message: 'Este código já foi resgatado por este usuário'
			}, 400);
		}
		await db.insert(userRedeems).values({
			userId: user.id,
			redeemId: redeem.id
		});
		if (redeem.itemTypeId && redeem.itemCount && redeem.itemCount > 0) {
			await applyUpdateInventory(c, user, {
				itemTypeId: redeem.itemTypeId,
				count: redeem.itemCount,
				userId: user.id,
				id: 0,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}
		if (redeem.characterId && redeem.skinId) {
			const state: StatePurchaseProductParams = {
				progressDiff: {
					characterProgress: [
						{
							characterId: redeem.characterId,
							skinIds: [redeem.skinId]
						}
					]
				}
			};
			await createSkins(c, state, user.id);
		}
		return c.json({
			error: false,
			message: 'Premiação enviada para a conta do e-mail caso ela exista com sucesso, saia e entre no jogo novamente!'
		});
	} catch (error) {
		console.error('Error process data:', error);
		return c.json({
			error: true,
			message: 'Error process data'
		}, 500);
	}
});

export function parseDurationToSeconds(duration: string): number {
	const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(\.\d+)?)S)?$/;
	const match = duration.match(regex);
	if (!match) return 0;
	const hours = match[1] ? parseInt(match[1], 10) : 0;
	const minutes = match[2] ? parseInt(match[2], 10) : 0;
	const seconds = match[3] ? parseFloat(match[3]) : 0;
	return hours * 3600 + minutes * 60 + seconds;
}
