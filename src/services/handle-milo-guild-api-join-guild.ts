import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateJoinGuildParams } from '@/interfaces/state-params';
import { guildMembers, guilds, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function handleMiloGuildApiJoinGuild(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user || user.guildId) {
			return returnGenericError(jsonrpc, id);
		}
		const state = params[0] as StateJoinGuildParams;
		if (!state || !state.guildId) {
			return returnGenericError(jsonrpc, id);
		}
		const [guildDetails] = await db.select({
			guild: guilds,
			totalMembers: sql`COUNT(${guildMembers.id})`.as('totalMembers'),
		})
			.from(guilds)
			.leftJoin(guildMembers, eq(guilds.id, guildMembers.guildId))
			.where(eq(guilds.id, state.guildId))
			.groupBy(guilds.id);
		if (!guildDetails || (guildDetails.totalMembers as number) >= guildDetails.guild.maxNumMembers) {
			return returnGenericError(jsonrpc, id);
		}
		await Promise.all([
			db.insert(guildMembers).values({userId: user.id, guildId: guildDetails.guild.id, status: 1}),
			db.update(users).set({ guildId: guildDetails.guild.id }).where(eq(users.id, user.id)),
		]);
		return {
			jsonrpc,
			id,
			result: {
				stateUpdateOutcome: 'CLIENT_REQUEST_ACCEPTED',
				responseStatus: 'OK',
			},
		}
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
