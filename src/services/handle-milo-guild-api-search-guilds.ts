import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { StateSearchGuildParams } from '@/interfaces/state-params';
import { guildMembers, guilds, users } from '@/db/schema';
import { eq, ilike, sql } from 'drizzle-orm';
import { GuildMember } from '@/db/model';
import { searchGuildStateUtils } from '@/utils/search-guild-state-utils';

interface ComputedProperty {
	name: string;
	value: string;
}

interface GuildMemberResult {
	coreUserId: number;
	status: number;
	editableProperties: any[];
	computedProperties: ComputedProperty[];
	internalProperties: any[];
}

export async function handleMiloGuildApiSearchGuilds(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	const result = {
		jsonrpc,
		id,
		result: {
			guilds: [] as GuildMemberResult[],
		},
	};
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return result;
		}
		if (method === 'MiloGuildApi.suggestGuilds2') {
			const getGuilds = await db
				.select({
					guild: guilds,
					members: sql<GuildMember[]>`array_agg(json_build_object(
          'id', ${guildMembers.id},
          'userId', ${guildMembers.userId},
          'status', ${guildMembers.status},
					'name', ${users.name},
					'skinId', ${users.skinId},
          'crashPoints', ${users.crashPointsEarned},
          'createdAt', ${guildMembers.createdAt}
        	))`.as('members'),
					totalCrashPoints: sql<number>`SUM(${users.crashPointsEarned})`.as('totalCrashPoints'),
					totalMembers: sql<number>`COUNT(${guildMembers.id})`.as('totalMembers'),
				})
				.from(guilds)
				.leftJoin(guildMembers, eq(guilds.id, guildMembers.guildId))
				.leftJoin(users, eq(guildMembers.userId, users.id))
				.groupBy(guilds.id)
				.orderBy(sql<number>`SUM(${users.crashPointsEarned}) DESC`)
				.limit(50);
			const guildsFound = getGuilds.map((guild) => {
				const state = JSON.parse(JSON.stringify(searchGuildStateUtils));
				state.guildId = guild.guild.id;
				state.name = guild.guild.name;
				state.description = guild.guild.description;
				state.editableProperties[0].value = guild.guild.badgeId.toString();
				state.computedProperties[4].value = guild.totalCrashPoints.toString();
				state.numMembers = +guild.totalMembers;
				state.members = guild.members.map((member) => {
					return {
						coreUserId: member.userId,
						status: member.status,
						editableProperties: [],
						computedProperties: [
							{ name: 'guildMemberName', value: user.name },
							{ name: 'memberActiveSkinId', value: user.skinId.toString() },
							{ name: 'contributedCrashPoints', value: user.crashPointsEarned.toString() },
						],
						internalProperties: [],
					};
				});
				return state;
			});
			result.result.guilds = guildsFound;
		}
		else {
			const state = params[0] as StateSearchGuildParams;
			if (!state || !state.searchString) {
				return result;
			}
			const searchTerm = `%${state.searchString}%`;
			const getGuilds = await db
				.select({
					guild: guilds,
					members: sql<GuildMember[]>`array_agg(json_build_object(
          'id', ${guildMembers.id},
          'userId', ${guildMembers.userId},
          'status', ${guildMembers.status},
					'name', ${users.name},
					'skinId', ${users.skinId},
          'crashPoints', ${users.crashPointsEarned},
          'createdAt', ${guildMembers.createdAt}
        	))`.as('members'),
					totalCrashPoints: sql<number>`SUM(${users.crashPointsEarned})`.as('totalCrashPoints'),
					totalMembers: sql<number>`COUNT(${guildMembers.id})`.as('totalMembers'),
				})
				.from(guilds)
				.leftJoin(guildMembers, eq(guilds.id, guildMembers.guildId))
				.leftJoin(users, eq(guildMembers.userId, users.id))
				.where(ilike(guilds.name, searchTerm))
				.groupBy(guilds.id)
				.orderBy(sql<number>`SUM(${users.crashPointsEarned}) DESC`)
				.limit(50);
			const guildsFound = getGuilds.map((guild) => {
				const state = JSON.parse(JSON.stringify(searchGuildStateUtils));
				state.guildId = guild.guild.id;
				state.name = guild.guild.name;
				state.description = guild.guild.description;
				state.editableProperties[0].value = guild.guild.badgeId.toString();
				state.computedProperties[4].value = guild.totalCrashPoints.toString();
				state.numMembers = +guild.totalMembers;
				state.members = guild.members.map((member) => {
					return {
						coreUserId: member.userId,
						status: member.status,
						editableProperties: [],
						computedProperties: [
							{ name: 'guildMemberName', value: user.name },
							{ name: 'memberActiveSkinId', value: user.skinId.toString() },
							{ name: 'contributedCrashPoints', value: user.crashPointsEarned.toString() },
						],
						internalProperties: [],
					};
				});
				return state;
			});
			result.result.guilds = guildsFound;
		}
		return result;
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return result;
	}
}
