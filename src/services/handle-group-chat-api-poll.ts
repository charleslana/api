import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { groupChats } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export interface GroupChatMessage {
	id: number;
	type: number;
	headers: any[];
	senderId: number;
	timestampMs: number;
	clientTimestampMs: number;
	body: string;
}

export async function handleGroupChatApiPoll(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		const result = returnGroupChat(jsonrpc, id);
		if (!user || !user.guildId) {
			return result;
		}
		const chats = await db.select().from(groupChats).where(eq(groupChats.guildId, user.guildId)).orderBy(desc(groupChats.timestampMs)).limit(50);
		if (chats.length > 0) {
			const messages = chats.map(chat => ({
				id: chat.id,
				type: 0,
				headers: [],
				senderId: chat.userId,
				timestampMs: chat.timestampMs,
				clientTimestampMs: 0,
				body: chat.body,
			}));
			result.result.messages.push(...messages);
			result.result.lastMessageId = chats[0].id;
		}
		return result;
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGroupChat(jsonrpc, id);
	}
}

function returnGroupChat(jsonrpc: string, id: number) {
	return {
		jsonrpc,
		id,
		result: {
			resultCodeId: 1,
			throttled: false,
			filtered: true,
			lastMessageId: 0,
			messages: [] as GroupChatMessage[],
		}
	};
}
