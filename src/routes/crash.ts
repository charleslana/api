import type { Env, Variables } from '@/lib/types';
import { zValidator } from '@hono/zod-validator';
import { Context, Hono } from 'hono';
import { z } from 'zod';
import { trackingApiGetUniqueACId } from '@/routes/crash-method';

export const crashRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

crashRoute.post('/', zValidator('query', z.object({
	_session: z.string().optional()
})), zValidator('json', z.array(z.object({
	jsonrpc: z.string(), id: z.coerce.number(), method: z.string(), params: z.array(z.any())
}))), async (c, next) => {
	const { _session } = c.req.valid('query');
	const arrayList = c.req.valid('json');
	const results = await Promise.all(arrayList.map(async (item) => {
		const { jsonrpc, id, method, params } = item;
		console.info('start..........');
		console.log('Header:', c.req.header());
		console.log('Query param:', _session);
		console.info('Body:', item);
		console.info('end............');
		const result = await handleMethod(c, method, jsonrpc, id, params);
		// console.info('Result', result);
		return {
			jsonrpc, id, result: {
				resultCode: 1, stateUpdateOutcome: 'CLIENT_REQUEST_ACCEPTED'
			}
		};
	}));
	return c.json(results);
	// return c.json(arrayList.length > 1 ? results : results[0]);
});

async function handleMethod(c: Context, method: string, jsonrpc: string, id: number, params: object[]) {
	if (method === 'TrackingApi.getUniqueACId') {
		return await trackingApiGetUniqueACId(c);
	} else if (method === 'AppDatabaseApi.getAppDatabase') {
		console.log(method);
	} else if (method === 'ApplicationSettingsApi.getSettings') {
		console.log('ApplicationSettingsApi.getSettings');
	} else if (method === 'AppKingAccountApi.getCurrentAccount') {
		console.log('AppKingAccountApi.getCurrentAccount');
	} else if (method === 'AppApi.notifyAppStart') {
		console.log('AppApi.notifyAppStart');
	} else if (method === 'OtaApi.selectPackageDescriptors') {
		console.log('OtaApi.selectPackageDescriptors');
	} else if (method === 'PushNotificationTokenApi.updatePushNotificationToken2') {
		console.log('PushNotificationTokenApi.updatePushNotificationToken2');
	} else if (method === 'AppCoreIdentityApi.logIn') {
		console.log('AppCoreIdentityApi.logIn');
	} else if (method === 'ServerAuthLiveOpsApi.getLiveOps') {
		console.log('ServerAuthLiveOpsApi.getLiveOps');
	} else if (method === 'AppAbTestApi.getAppUserAbCases') {
		console.log('AppAbTestApi.getAppUserAbCases');
	} else if (method === 'AppKingAccountApi.acceptTermsOfServiceAndPrivacyPolicy') {
		console.log('AppKingAccountApi.acceptTermsOfServiceAndPrivacyPolicy');
	} else if (method === 'AppCoreIdentityApi.getAuthenticationInfo') {
		console.log('AppCoreIdentityApi.getAuthenticationInfo');
	} else if (method === 'AppPermissionsApi.getConsents3') {
		console.log('AppPermissionsApi.getConsents3');
	} else if (method === 'AppTimeApi.getServerTime') {
		console.log('AppTimeApi.getServerTime');
	} else if (method === 'AppCommonCatalogApi.getCatalog') {
		console.log('AppCommonCatalogApi.getCatalog');
	} else if (method === 'ConfigApi.getConfigEntriesCached') {
		console.log('ConfigApi.getConfigEntriesCached');
	} else if (method === 'AppClientCrashReport.trackCrashReport') {
		console.log('AppClientCrashReport.trackCrashReport');
	} else if (method === 'MiloGuildApi.getCommonGuildSettings') {
		console.log('MiloGuildApi.getCommonGuildSettings');
	} else if (method === 'MiloGuildApi.getMyGuild') {
		console.log('MiloGuildApi.getMyGuild');
	} else if (method === 'UnlockApi.unlockBuildings') {
		console.log('UnlockApi.unlockBuildings');
	} else if (method === 'StateApi.syncState') {
		console.log('StateApi.syncState');
	} else if (method === 'ShopApi.loadProducts') {
		console.log('ShopApi.loadProducts');
	} else if (method === 'RunnerApi.playerDeath') {
		console.log('RunnerApi.playerDeath');
	} else if (method === 'RunnerApi.endCollectionRun') {
		console.log('RunnerApi.endCollectionRun');
	} else if (method === 'ShopApi.deliverOpenTransactions') {
		console.log('ShopApi.deliverOpenTransactions');
	} else if (method === 'MiloGuildApi.getGuildJoinCooldownLeft') {
		console.log('MiloGuildApi.getGuildJoinCooldownLeft');
	} else if (method === 'MiloGuildApi.suggestGuilds2') {
		console.log('MiloGuildApi.suggestGuilds2');
	} else if (method === 'MiloGuildApi.createGuild') {
		console.log('MiloGuildApi.createGuild');
	} else if (method === 'ShopApi.purchaseProduct') {
		console.log('ShopApi.purchaseProduct');
	} else if (method === 'MiloSeasonApi.spendTeamRunTicket') {
		console.log('MiloSeasonApi.spendTeamRunTicket');
	} else if (method === 'RunnerApi.endRun') {
		console.log('RunnerApi.endRun');
	} else if (method === 'PackApi.claimPack') {
		console.log('PackApi.claimPack');
	} else if (method === 'AppEmailAndPasswordIdentityApi.authenticate') {
		console.log('AppEmailAndPasswordIdentityApi.authenticate');
	} else if (method === 'AppEmailAndPasswordIdentityApi.link') {
		console.log('AppEmailAndPasswordIdentityApi.link');
	} else if (method === 'ProductionApi.startProducer') {
		console.log('ProductionApi.startProducer');
	} else if (method === 'ProductionApi.collectProducer') {
		console.log('ProductionApi.collectProducer');
	} else if (method === 'ProgressApi.levelUpPlayer') {
		console.log('ProgressApi.levelUpPlayer');
	} else if (method === 'ProfileApi.setPlayerActiveSkin') {
		console.log('ProfileApi.setPlayerActiveSkin');
	} else if (method === 'UnlockApi.unlockLand') {
		console.log('UnlockApi.unlockLand');
	} else if (method === 'UnlockApi.unlockItems') {
		console.log('UnlockApi.unlockItems');
	} else if (method === 'ProgressApi.startTutorial') {
		console.log('ProgressApi.startTutorial');
	} else if (method === 'ProductionApi.upgradeBuilding') {
		console.log('ProductionApi.upgradeBuilding');
	} else if (method === 'ProductionApi.speedUpProducer') {
		console.log('ProductionApi.speedUpProducer');
	} else if (method === 'ProgressApi.finishedTutorial') {
		console.log('ProgressApi.finishedTutorial');
	} else if (method === 'ProductionApi.buyProducer') {
		console.log('ProductionApi.buyProducer');
	} else if (method === 'MiloGuildApi.searchGuilds') {
		console.log('MiloGuildApi.searchGuilds');
	} else if (method === 'AppStoreApi.createJournal4') {
		console.log('AppStoreApi.createJournal4');
	} else if (method === 'MiloGuildApi.getGuild') {
		console.log('MiloGuildApi.getGuild');
	} else if (method === 'MiloGuildApi.joinGuild') {
		console.log('MiloGuildApi.joinGuild');
	} else if (method === 'MiloGuildApi.reportAbusiveContent') {
		console.log('MiloGuildApi.reportAbusiveContent');
	} else if (method === 'ProfileApi.getPlayerStats') {
		console.log('ProfileApi.getPlayerStats');
	} else if (method === 'ProfileApi.reportPlayer') {
		console.log('ProfileApi.reportPlayer');
	} else if (method === 'MiloGuildApi.kickMember') {
		console.log('MiloGuildApi.kickMember');
	} else if (method === 'AppEmailAndPasswordIdentityApi.checkPassword') {
		console.log('AppEmailAndPasswordIdentityApi.checkPassword');
	} else if (method === 'AppEmailAndPasswordIdentityApi.resetPassword') {
		console.log('AppEmailAndPasswordIdentityApi.resetPassword');
	} else if (method === 'AppCoreIdentityApi.signUp') {
		console.log('AppCoreIdentityApi.signUp');
	} else if (method === 'AppCoreIdentityApi.authenticate') {
		console.log('AppCoreIdentityApi.authenticate');
	} else if (method === 'AdsApi.egpPurchase') {
		console.log('AdsApi.egpPurchase');
	} else if (method === 'UnlockApi.unlockIsland') {
		console.log('UnlockApi.unlockIsland');
	} else if (method === 'QuestApi.reportQuestProgress') {
		console.log('QuestApi.reportQuestProgress');
	} else if (method === 'ProductionApi.startProducerMissingResources') {
		console.log('ProductionApi.startProducerMissingResources');
	} else if (method === 'MiloGuildApi.leaveGuild') {
		console.log('MiloGuildApi.leaveGuild');
	} else if (method === 'GroupChatApi.poll') {
		console.log('GroupChatApi.poll');
	} else if (method === 'GroupChatApi.postAndPoll') {
		console.log('GroupChatApi.postAndPoll');
	} else if (method === 'GroupChatApi.reportAbusiveMessage') {
		console.log('GroupChatApi.reportAbusiveMessage');
	} else if (method === 'ProductionApi.upgradeBuildingMissingResources') {
		console.log('ProductionApi.upgradeBuildingMissingResources');
	} else if (method === 'StateApi.completeState') {
		console.log('StateApi.completeState');
	} else if (method === 'AppKingAccountApi.updateCurrentAccount') {
		console.log('AppKingAccountApi.updateCurrentAccount');
	} else if (method === 'AppEmailAndPasswordIdentityApi.updateEmailAddress') {
		console.log('AppEmailAndPasswordIdentityApi.updateEmailAddress');
	} else if (method === 'AppEmailAndPasswordIdentityApi.updatePassword') {
		console.log('AppEmailAndPasswordIdentityApi.updatePassword');
	} else if (method === 'ProductionApi.buyProducerMissingResources') {
		console.log('ProductionApi.buyProducerMissingResources');
	} else if (method === 'InventoryApi.sellItems') {
		console.log('InventoryApi.sellItems');
	} else {
		console.error('Method not implemented:', method);
		return c.json({ error: 'Method not implemented' }, 501);
	}
}
