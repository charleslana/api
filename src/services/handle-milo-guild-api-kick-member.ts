import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { returnGenericError } from '@/shared/return-generic-error';
import { guildMembers, users } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { returnGenericSuccess } from '@/shared/return-generic-success';

export async function handleMiloGuildApiKickMember(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user || !user.guildId) {
			return returnGenericError(jsonrpc, id);
		}
		const guildId = params[0] as number;
		const userId = params[1] as number;
		if (!userId) {
			return returnGenericError(jsonrpc, id);
		}
		const [guidMember] = await db.select().from(guildMembers)
			.where(and(eq(guildMembers.userId, user.id), eq(guildMembers.status, 2), eq(guildMembers.guildId, user.guildId)));
		if (!guidMember || guidMember.userId == userId) {
			return returnGenericError(jsonrpc, id);
		}
		const [userKicked] = await db.select().from(users).where(and(eq(users.id, userId), eq(users.guildId, user.guildId)));
		if (!userKicked) {
			return returnGenericError(jsonrpc, id);
		}
		await Promise.all([
			db
				.delete(guildMembers)
				.where(and(eq(guildMembers.userId, userId), eq(guildMembers.guildId, user.guildId))),
			db
				.update(users)
				.set({guildId: null})
				.where(eq(users.id, userId)),
		]);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
