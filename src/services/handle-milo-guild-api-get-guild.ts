import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { guildMembers, guilds, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { guildStateUtils } from '@/utils/guild-state-utils';

interface GuildMember {
	id: number;
	userId: number;
	status: number;
	name: string;
	skinId: number;
	crashPoints: number;
	createdAt: Date;
}

export async function handleMiloGuildApiGetGuild(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		const guildId = params[0] as number;
		if (!guildId || guildId < -2147483648 || guildId > 2147483647) {
			return returnGenericError(jsonrpc, id);
		}
		const guildRankSubquery = db
			.select({
				guildId: guilds.id,
				totalCrashPoints: sql`SUM(${users.crashPointsEarned})`.as('totalCrashPoints'),
				rank: sql`RANK() OVER (ORDER BY SUM(${users.crashPointsEarned}) DESC)`.as('rank'),
			})
			.from(guilds)
			.leftJoin(guildMembers, eq(guilds.id, guildMembers.guildId))
			.leftJoin(users, eq(guildMembers.userId, users.id))
			.groupBy(guilds.id)
			.as('rankSubquery');
		const [guildDetails] = await db
			.select({
				guild: guilds,
				members: sql`array_agg(json_build_object(
          'id', ${guildMembers.id},
          'userId', ${guildMembers.userId},
          'status', ${guildMembers.status},
					'name', ${users.name},
					'skinId', ${users.skinId},
          'crashPoints', ${users.crashPointsEarned},
          'createdAt', ${guildMembers.createdAt}
        ))`.as('members'),
				totalCrashPoints: sql`SUM(${users.crashPointsEarned})`.as('totalCrashPoints'),
				totalMembers: sql`COUNT(${guildMembers.id})`.as('totalMembers'),
				rank: guildRankSubquery.rank,
			})
			.from(guilds)
			.leftJoin(guildMembers, eq(guilds.id, guildMembers.guildId))
			.leftJoin(users, eq(guildMembers.userId, users.id))
			.leftJoin(guildRankSubquery, eq(guilds.id, guildRankSubquery.guildId))
			.where(eq(guilds.id, guildId))
			.groupBy(guilds.id, guildRankSubquery.rank);
		if (!guildDetails) {
			return returnGenericError(jsonrpc, id);
		}
		const state = guildStateUtils;
		state.guildId = guildDetails.guild.id;
		state.name = guildDetails.guild.name;
		state.description = guildDetails.guild.description;
		state.numMembers = guildDetails.totalMembers as number;
		state.editableProperties[0].value = guildDetails.guild.badgeId.toString();
		state.computedProperties[4].value = (guildDetails.totalCrashPoints as number).toString();
		state.computedProperties[2].value = (guildDetails.rank as number).toString();
		const members = (guildDetails.members as GuildMember[]).map((member) => {
			return {
				coreUserId: member.userId,
				status: member.status,
				editableProperties: [],
				computedProperties: [
					{ name: 'guildMemberName', value: member.name},
					{ name: 'memberActiveSkinId', value: member.skinId.toString() },
					{ name: 'contributedCrashPoints', value: member.crashPoints.toString() },
				],
				internalProperties: [],
			};
		});
		state.members = members;
		return {
			jsonrpc,
			id,
			result: state
		}
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
