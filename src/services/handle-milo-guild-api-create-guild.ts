import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateCreateGuildParams } from '@/interfaces/state-params';
import { guildMembers, guilds, inventories, lower, users } from '@/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { applyUpdateInventory } from '@/services/update-inventory';
import { initEmptyStateUtils } from '@/utils/init-empty-state-utils';
import { validateName } from '@/utils/utils';

export async function handleMiloGuildApiCreateGuild(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user || user.guildId) {
			return returnGenericError(jsonrpc, id);
		}
		const state = params[0] as StateCreateGuildParams;
		if (!state || !state.guildBadge || state.guildBadge < 0 || state.guildBadge > 5 || !state.guildName || !validateName(state.guildName) || state.guildName.trim().length < 3 || state.guildName.trim().length > 32 || !state.guildDescription || state.guildDescription.trim().length < 1 || state.guildDescription.trim().length > 120) {
			return returnGenericError(jsonrpc, id);
		}
		const [inventory] = await db.select().from(inventories)
			.where(and(eq(inventories.userId, user.id), eq(inventories.itemTypeId, 81000), gte(inventories.count, 10)));
		if (!inventory) {
			return returnGenericError(jsonrpc, id);
		}
		const existingName = await findGuildByName(c, state.guildName.trim());
		if (existingName) {
			return returnGenericError(jsonrpc, id);
		}
		const [newGuild] = await db.insert(guilds).values({
			name: state.guildName.trim(), description: state.guildDescription.trim(), badgeId: state.guildBadge,
		}).returning({ id: guilds.id });
		await Promise.all([
			db.insert(guildMembers).values({userId: user.id, guildId: newGuild.id}),
			db.update(users).set({ guildId: newGuild.id }).where(eq(users.id, user.id)),
			applyUpdateInventory(c, user, {
				itemTypeId: 81000,
				count: -10,
				userId: user.id,
				id: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		]);
		const emptyState = initEmptyStateUtils;
		emptyState.inventoryDiff.items = [{ itemTypeId: 81000, count: -10 }];
		return {
			jsonrpc,
			id,
			result: {
				stateUpdateOutcome: 'CLIENT_REQUEST_ACCEPTED',
				...emptyState,
				responseStatus: 'OK',
			}
		};
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

export async function findGuildByName(c: Context<{ Bindings: Env, Variables: Variables }>, name: string) {
	const db = c.get('db');
	const [guild] = await db.select().from(guilds).where(eq(lower(guilds.name), name.toLowerCase()));
	return guild;
}
