import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { updateInventory } from '@/services/update-inventory';
import { returnGenericSuccess } from '@/shared/return-generic-success';
import { returnGenericError } from '@/shared/return-generic-error';
import { updateProgress } from '@/services/update-progress';
import {
	StateColoredGemParams,
	StateCooldownParams,
	StateGangParams,
	StateRelicParams
} from '@/interfaces/state-params';
import { coloredGems, cooldowns, gangs, relics } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { User } from '@/db/model';

export async function handleRunnerApiEndRun(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const user = await updateInventory(c, params, session);
		if (!user) {
			return returnGenericError(jsonrpc, id);
		}
		await Promise.all([
			updateProgress(c, params, session, user),
			updateGang(c, params, user),
			updateColoredGem(c, params, user),
			updateCooldown(c, params, user),
			updateRelic(c, params, user),
		]);
		return returnGenericSuccess(jsonrpc, id);
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}

async function updateGang(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], user: User) {
	const state = params[0] as StateGangParams;
	if (!state || !state.progressDiff || !state.progressDiff.currentGangProgress || !state.progressDiff.currentGangProgress.defeatedBossIds || !state.progressDiff.currentGangProgress.defeatedBossIds.length) {
		return;
	}
	const db = c.get('db');
	const exists = state.progressDiff.currentGangProgress.defeatedBossIds.some(item => item === -1);
	if (exists) {
		await db.delete(gangs).where(eq(gangs.userId, user.id));
		return;
	}
	const promises = state.progressDiff.currentGangProgress.defeatedBossIds.map(async (item) => {
		const [existingItem] = await db
			.select()
			.from(gangs)
			.where(and(eq(gangs.userId, user.id), eq(gangs.defeatedBossId, item)));
		if (existingItem) {
			return null;
		}
		return db.insert(gangs).values({ userId: user.id, defeatedBossId: item }).returning();
	});
	await Promise.all(promises);
}

async function updateColoredGem(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], user: User) {
	const state = params[0] as StateColoredGemParams;
	if (!state || !state.progressDiff || !state.progressDiff.coloredGems || !state.progressDiff.coloredGems.length) {
		return;
	}
	const db = c.get('db');
	const promises = state.progressDiff.coloredGems.map(async (item) => {
		const [existingItem] = await db
			.select()
			.from(coloredGems)
			.where(and(eq(coloredGems.userId, user.id), eq(coloredGems.islandId, item.islandId)));
		if (existingItem) {
			const updatedArray = Array.from(new Set([...existingItem.coloredGems, ...item.coloredGems]));
			return db
				.update(coloredGems)
				.set({ coloredGems: updatedArray })
				.where(and(eq(coloredGems.userId, user.id), eq(coloredGems.islandId, item.islandId)))
				.returning();
		}
		return db.insert(coloredGems).values({ userId: user.id, islandId: item.islandId, coloredGems: item.coloredGems }).returning();
	});
	await Promise.all(promises);
}

async function updateCooldown(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], user: User) {
	const state = params[0] as StateCooldownParams;
	if (!state || !state.gameStateDiff || !state.gameStateDiff.cooldowns || !state.gameStateDiff.cooldowns.length) {
		return;
	}
	const db = c.get('db');
	const promises = state.gameStateDiff.cooldowns.map(async (item) => {
		const [existingItem] = await db
			.select()
			.from(cooldowns)
			.where(and(eq(cooldowns.userId, user.id), eq(cooldowns.cooldownId, item.cooldownId)));
		if (existingItem) {
			return db
				.update(cooldowns)
				.set({ cooldownSeconds: item.cooldownSeconds, clientTimeStarted: cooldowns.clientTimeStarted })
				.where(and(eq(cooldowns.userId, user.id), eq(cooldowns.cooldownId, item.cooldownId)))
				.returning();
		}
		return db.insert(cooldowns).values({
			userId: user.id,
			cooldownId: item.cooldownId,
			cooldownSeconds: item.cooldownSeconds,
			clientTimeStarted: item.clientTimeStarted
		}).returning();
	});
	await Promise.all(promises);
}

async function updateRelic(c: Context<{
	Bindings: Env, Variables: Variables
}>, params: any[], user: User) {
	const state = params[0] as StateRelicParams;
	if (!state || !state.progressDiff || !state.progressDiff.relicProgress || !state.progressDiff.relicProgress.length) {
		return;
	}
	const db = c.get('db');
	const promises = state.progressDiff.relicProgress.map(async (item) => {
		const [existingItem] = await db
			.select()
			.from(relics)
			.where(and(eq(relics.userId, user.id), eq(relics.landId, item.landId)));
		if (existingItem) {
			return db
				.update(relics)
				.set({ relicId: item.relicId, playerBestDuration: relics.playerBestDuration })
				.where(and(eq(relics.userId, user.id), eq(relics.landId, item.landId)))
				.returning();
		}
		return db.insert(relics).values({
			userId: user.id,
			landId: item.landId,
			relicId: item.relicId,
			playerBestDuration: item.playerBestDuration
		}).returning();
	});
	await Promise.all(promises);
}
