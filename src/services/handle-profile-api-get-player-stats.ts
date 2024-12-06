import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { skins, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { User } from '@/db/model';
import { returnGenericError } from '@/shared/return-generic-error';

export async function handleProfileApiGetPlayerStats(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const userId = params[0] as number;
		if (!userId) {
			return;
		}
		const [userDetails] = await db
			.select({
				user: users,
				totalSkins: sql<number>`COUNT(${skins.id})`,
				totalPowerGems: sql<number>`
					(SELECT COALESCE(SUM("numPowerGems"), 0)
					 FROM "powerGems"
					 WHERE "powerGems"."userId" = ${users.id}
					)
				`,
			})
			.from(users)
			.leftJoin(skins, eq(skins.userId, users.id))
			.where(eq(users.id, userId))
			.groupBy(users.id);
		if (!userDetails) {
			return returnGenericError(jsonrpc, id);
		}
		return getProfile(jsonrpc, id, userDetails.user, userDetails.totalPowerGems, userDetails.totalSkins);
	} catch (error) {
		console.error('Erro ao processar informação:', error);
		throw error;
	}
}

function getProfile(jsonrpc: string, id: number, user: User, powerGemCount: number, skinCount: number) {
	return {
		jsonrpc,
		id,
		result: {
			coreUserId: user.id,
			xp: user.xp,
			level: user.level,
			powerGems: +powerGemCount,
			numberOfSkins: +skinCount,
		},
	};
}
