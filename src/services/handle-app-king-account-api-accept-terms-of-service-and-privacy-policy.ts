import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';

export async function handleAppKingAccountApiAcceptTermsOfServiceAndPrivacyPolicy(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return {
		jsonrpc,
		id,
		result: {
			acceptToSResultCode: 0,
			acceptToSResultMessage: '',
			toSAndPPAcceptanceDto: {
				acceptedVersion: 2,
				latestVersion: 2,
				latestToSUrl: 'about:blank',
				latestPPUrl: 'about:blank',
			},
		},
	};
}
