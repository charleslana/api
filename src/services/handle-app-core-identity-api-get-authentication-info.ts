import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericError } from '@/shared/return-generic-error';
import { getUserSession } from '@/services/get-user-session';

export async function handleAppCoreIdentityApiGetAuthenticationInfo(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		let emailAddr = '';
		const user = await getUserSession(c, session);
		if (user) {
			emailAddr = user.email;
		}
		const result: { methodInfos: any[] } = { methodInfos: [] };
		const list = params[0] as number[];
		if (!list || !list.length) {
			emailAddr = '';
		}
		for (const item of list) {
			if (item === 1) {
				if (emailAddr === '') {
					result.methodInfos.push({
						methodId: 1,
						links: [],
					});
				} else {
					result.methodInfos.push({
						methodId: 1,
						links: [
							{
								id: emailAddr,
								linkStatus: 1,
								primary: true,
								emailVerified: false,
							},
						],
					});
				}
			}
		}
		return {
			jsonrpc,
			id,
			result: result,
		};
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
