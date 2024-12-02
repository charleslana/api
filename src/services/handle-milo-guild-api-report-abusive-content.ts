import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericResponse } from '@/shared/return-generic-response';

export async function handleMiloGuildApiReportAbusiveContent(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	return returnGenericResponse(jsonrpc, id);
}
