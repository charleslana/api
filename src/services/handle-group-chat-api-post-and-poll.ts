import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';
import { GroupChatMessage } from '@/services/handle-group-chat-api-poll';
import { StatePostAndPollParams } from '@/interfaces/state-params';
import { groupChats } from '@/db/schema';

export async function handleGroupChatApiPostAndPoll(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		const result = returnGroupChat(jsonrpc, id);
		if (!user || !user.guildId) {
			return result;
		}
		const state = params[1] as StatePostAndPollParams;
		if (!state || !state.body || state.body.trim().length === 0 || state.body.trim().length > 240) {
			return result;
		}
		const [newChat] = await db.insert(groupChats).values({
			userId: user.id,
			guildId: user.guildId,
			timestampMs: Date.now(),
			body: state.body.trim(),
		}).returning();
		result.result.messages.push({
			id: newChat.id,
			body: newChat.body,
			senderId: user.id,
			type: 0,
			headers: [],
			timestampMs: newChat.timestampMs,
			clientTimestampMs: 0,
		});
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
			messages: [] as GroupChatMessage[],
		}
	};
}
