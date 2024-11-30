import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';

export async function handleAppAbTestApiGetAppUserAbCases(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	const defaultAbCaseValues: Record<string, number> = {
		milo_battle_run_speed_up: 0,
		milo_collection_run_speed_up_2: 0,
		milo_egp_ingredient_checkpoint_loss: 5,
		milo_forage_run_goal: 1,
		milo_instant_respawn: 1,
		milo_low_60fps: 1,
		milo_offers_rework: 0,
		milo_revamp_phase_3: 1,
	};
	const userAbCases = params[0] as string[];
	if (!userAbCases) {
		return;
	}
	const cases = userAbCases.map(userAbCase => ({
		version: 0,
		caseNum: defaultAbCaseValues[userAbCase] ?? 0,
	}));
	return {
		jsonrpc,
		id,
		result: {
			cases: cases,
		},
	};
}
