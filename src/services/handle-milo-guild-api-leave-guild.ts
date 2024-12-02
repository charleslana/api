import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { returnGenericResponse } from '@/shared/return-generic-response';
import { guildMembers, guilds, users } from '@/db/schema';
import { and, asc, eq, ne } from 'drizzle-orm';

export async function handleMiloGuildApiLeaveGuild(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user || !user.guildId) {
			return returnGenericError(jsonrpc, id);
		}
		const [guidMember] = await db.select().from(guildMembers)
			.where(and(eq(guildMembers.userId, user.id), eq(guildMembers.status, 2), eq(guildMembers.guildId, user.guildId)));
		if (guidMember) {
			const [oldestGuildMember] = await db
				.select({
					id: guildMembers.id,
					userId: guildMembers.userId,
					createdAt: guildMembers.createdAt,
				})
				.from(guildMembers)
				.where(
					and(
						eq(guildMembers.guildId, user.guildId),
						ne(guildMembers.userId, user.id),
						ne(guildMembers.status, 2)
					)
				)
				.orderBy(asc(guildMembers.createdAt))
				.limit(1);
			if (oldestGuildMember) {
				await Promise.all([
					db
						.update(guildMembers)
						.set({ status: 2 })
						.where(eq(guildMembers.id, oldestGuildMember.id)),
					db.delete(guildMembers).where(and(eq(guildMembers.userId, user.id), eq(guildMembers.guildId, user.guildId))),
					db.update(users).set({guildId: null}).where(eq(users.id, user.id)),
				]);
			} else {
				await Promise.all([
					db.delete(guilds).where(eq(guilds.id, user.guildId)),
					db.update(users).set({guildId: null}).where(eq(users.id, user.id)),
				]);
			}
		} else {
			await Promise.all([
				db.delete(guildMembers).where(and(eq(guildMembers.userId, user.id), eq(guildMembers.guildId, user.guildId))),
				db.update(users).set({guildId: null}).where(eq(users.id, user.id)),
			]);
		}
		return returnGenericResponse(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
