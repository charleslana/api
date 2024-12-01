import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { getUserSession } from '@/services/get-user-session';

export async function handleAppKingAccountApiGetCurrentAccount(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	let coreUserId = 0;
	let name = 'guest';
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return returnGetCurrentAccount(jsonrpc, id, coreUserId, name);
		}
		coreUserId = user.id;
		name = user.name;
		return returnGetCurrentAccount(jsonrpc, id, coreUserId, name);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGetCurrentAccount(jsonrpc, id, coreUserId, name);
	}
}

function returnGetCurrentAccount(jsonrpc: string, id: number, coreUserId: number, name: string) {
	return {
		jsonrpc,
		id,
		result: {
			coreUserId: coreUserId,
			toSAndPPAcceptanceDto: {
				acceptedVersion: 2,
				latestVersion: 2,
				latestToSUrl: 'about:blank',
				latestPPUrl: 'about:blank',
			},
			avatarUploadEnabled: false,
			editable: coreUserId !== 0,
			name: name,
			avatarUrl: null,
			bigAvatarUrl: null,
			dateOfBirthKnown: false,
			dateOfBirthRequired: false,
			ageGateStateId: 1,
		},
	};
}
