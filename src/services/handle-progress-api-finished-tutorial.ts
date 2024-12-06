import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { StateTutorialParams } from '@/interfaces/state-params';
import { Tutorial, User } from '@/db/model';
import { tutorials } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getUserSession } from '@/services/get-user-session';

export async function handleProgressApiFinishedTutorial(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await getUserSession(c, session);
		if (!user) {
			return;
		}
		const state = params[0] as StateTutorialParams;
		if (!state || !state.progressDiff || !state.progressDiff.tutorialProgress || !state.progressDiff.tutorialProgress.length) {
			return returnGenericError(jsonrpc, id);
		}
		const promises = state.progressDiff.tutorialProgress.map(async (item) => {
			if (item.tutorialId) {
				return await updateTutorial(c, user, item);
			}
		});
		await Promise.all(promises);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function updateTutorial(c: Context<{
	Bindings: Env, Variables: Variables
}>, user: User, item: Tutorial) {
	const db = c.get('db');
	const [existingItem] = await db
		.select()
		.from(tutorials)
		.where(and(eq(tutorials.userId, user.id), eq(tutorials.tutorialId, item.tutorialId)));
	if (existingItem) {
		return null;
	}
	return db.insert(tutorials).values({ userId: user.id, tutorialId: item.tutorialId }).returning();
}
