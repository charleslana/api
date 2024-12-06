import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';

export async function handleQuestApiReportQuestProgress(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return returnGenericSuccess(jsonrpc, id);
}
