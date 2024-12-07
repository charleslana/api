import type { Env, Variables } from '@/lib/types';
import { zValidator } from '@hono/zod-validator';
import { Context, Hono } from 'hono';
import { z } from 'zod';
import { handleTrackingApiGetUniqueACId } from '@/services/handle-tracking-api-get-unique-a-c-id';
import { handleAdsApiEgpPurchase } from '@/services/handle-ads-api-egp-purchase';
import { handleAppAbTestApiGetAppUserAbCases } from '@/services/handle-app-ab-test-api-get-app-user-ab-cases';
import { handleAppApiNotifyAppStart } from '@/services/handle-app-api-notify-app-start';
import {
	handleAppClientCrashReportTrackCrashReport
} from '@/services/handle-app-client-crash-report-track-crash-report';
import { handleAppCommonCatalogApiGetCatalog } from '@/services/handle-app-common-catalog-api-get-catalog';
import { handleAppCoreIdentityApiAuthenticate } from '@/services/handle-app-core-identity-api-authenticate';
import {
	handleAppCoreIdentityApiGetAuthenticationInfo
} from '@/services/handle-app-core-identity-api-get-authentication-info';
import { handleAppCoreIdentityApiLogIn } from '@/services/handle-app-core-identity-api-log-in';
import { handleAppCoreIdentityApiSignUp } from '@/services/handle-app-core-identity-api-sign-up';
import { handleAppDatabaseApiGetAppDatabase } from '@/services/handle-app-database-api-get-app-database';
import {
	handleAppEmailAndPasswordIdentityApiCheckPassword
} from '@/services/handle-app-email-and-password-identity-api-check-password';
import { handleAppEmailAndPasswordIdentityApiLink } from '@/services/handle-app-email-and-password-identity-api-link';
import {
	handleAppEmailAndPasswordIdentityApiResetPassword
} from '@/services/handle-app-email-and-password-identity-api-reset-password';
import {
	handleAppEmailAndPasswordIdentityApiUpdateEmailAddress
} from '@/services/handle-app-email-and-password-identity-api-update-email-address';
import {
	handleAppEmailAndPasswordIdentityApiUpdatePassword
} from '@/services/handle-app-email-and-password-identity-api-update-password';
import {
	handleAppKingAccountApiAcceptTermsOfServiceAndPrivacyPolicy
} from '@/services/handle-app-king-account-api-accept-terms-of-service-and-privacy-policy';
import { handleAppKingAccountApiGetCurrentAccount } from '@/services/handle-app-king-account-api-get-current-account';
import {
	handleAppKingAccountApiUpdateCurrentAccount
} from '@/services/handle-app-king-account-api-update-current-account';
import { handleAppPermissionsApiGetConsents3 } from '@/services/handle-app-permissions-api-get-consents-3';
import { handleAppStoreApiCreateJournal4 } from '@/services/handle-app-store-api-create-journal-4';
import { handleAppTimeApiGetServerTime } from '@/services/handle-app-time-api-get-server-time';
import { handleApplicationSettingsApiGetSettings } from '@/services/handle-application-settings-api-get-settings';
import { handleConfigApiGetConfigEntriesCached } from '@/services/handle-config-api-get-config-entries-cached';
import { handleGroupChatApiPoll } from '@/services/handle-group-chat-api-poll';
import { handleGroupChatApiPostAndPoll } from '@/services/handle-group-chat-api-post-and-poll';
import { handleGroupChatApiReportAbusiveMessage } from '@/services/handle-group-chat-api-report-abusive-message';
import { handleInventoryApiSellItems } from '@/services/handle-inventory-api-sell-items';
import { handleMiloGuildApiCreateGuild } from '@/services/handle-milo-guild-api-create-guild';
import { handleMiloGuildApiGetCommonGuildSettings } from '@/services/handle-milo-guild-api-get-common-guild-settings';
import {
	handleMiloGuildApiGetGuildJoinCooldownLeft
} from '@/services/handle-milo-guild-api-get-guild-join-cooldown-left';
import { handleMiloGuildApiGetGuild } from '@/services/handle-milo-guild-api-get-guild';
import { handleMiloGuildApiGetMyGuild } from '@/services/handle-milo-guild-api-get-my-guild';
import { handleMiloGuildApiJoinGuild } from '@/services/handle-milo-guild-api-join-guild';
import { handleMiloGuildApiKickMember } from '@/services/handle-milo-guild-api-kick-member';
import { handleMiloGuildApiLeaveGuild } from '@/services/handle-milo-guild-api-leave-guild';
import { handleMiloGuildApiReportAbusiveContent } from '@/services/handle-milo-guild-api-report-abusive-content';
import { handleMiloGuildApiSearchGuilds } from '@/services/handle-milo-guild-api-search-guilds';
import { handleMiloGuildApiSuggestGuilds2 } from '@/services/handle-milo-guild-api-suggest-guilds-2';
import { handleMiloSeasonApiSpendTeamRunTicket } from '@/services/handle-milo-season-api-spend-team-run-ticket';
import { handleOtaApiSelectPackageDescriptors } from '@/services/handle-ota-api-select-package-descriptors';
import { handlePackApiClaimPack } from '@/services/handle-pack-api-claim-pack';
import {
	handleProductionApiBuyProducerMissingResources
} from '@/services/handle-production-api-buy-producer-missing-resources';
import { handleProductionApiBuyProducer } from '@/services/handle-production-api-buy-producer';
import { handleProductionApiCollectProducer } from '@/services/handle-production-api-collect-producer';
import { handleProductionApiSpeedUpProducer } from '@/services/handle-production-api-speed-up-producer';
import {
	handleProductionApiStartProducerMissingResources
} from '@/services/handle-production-api-start-producer-missing-resources';
import { handleProductionApiStartProducer } from '@/services/handle-production-api-start-producer';
import {
	handleProductionApiUpgradeBuildingMissingResources
} from '@/services/handle-production-api-upgrade-building-missing-resources';
import { handleProductionApiUpgradeBuilding } from '@/services/handle-production-api-upgrade-building';
import { handleProfileApiGetPlayerStats } from '@/services/handle-profile-api-get-player-stats';
import { handleProfileApiReportPlayer } from '@/services/handle-profile-api-report-player';
import { handleProfileApiSetPlayerActiveSkin } from '@/services/handle-profile-api-set-player-active-skin';
import { handleProgressApiFinishedTutorial } from '@/services/handle-progress-api-finished-tutorial';
import { handleProgressApiLevelUpPlayer } from '@/services/handle-progress-api-level-up-player';
import { handleProgressApiStartTutorial } from '@/services/handle-progress-api-start-tutorial';
import {
	handlePushNotificationTokenApiUpdatePushNotificationToken2
} from '@/services/handle-push-notification-token-api-update-push-notification-token-2';
import { handleQuestApiReportQuestProgress } from '@/services/handle-quest-api-report-quest-progress';
import { handleRunnerApiEndCollectionRun } from '@/services/handle-runner-api-end-collection-run';
import { handleRunnerApiEndRun } from '@/services/handle-runner-api-end-run';
import { handleRunnerApiPlayerDeath } from '@/services/handle-runner-api-player-death';
import { handleServerAuthLiveOpsApiGetLiveOps } from '@/services/handle-server-auth-live-ops-api-get-live-ops';
import { handleShopApiDeliverOpenTransactions } from '@/services/handle-shop-api-deliver-open-transactions';
import { handleShopApiLoadProducts } from '@/services/handle-shop-api-load-products';
import { handleShopApiPurchaseProduct } from '@/services/handle-shop-api-purchase-product';
import { handleUnlockApiUnlockBuildings } from '@/services/handle-unlock-api-unlock-buildings';
import { handleUnlockApiUnlockLand } from '@/services/handle-unlock-api-unlock-land';
import { handleUnlockApiUnlockIsland } from '@/services/handle-unlock-api-unlock-island';
import { handleUnlockApiUnlockItems } from '@/services/handle-unlock-api-unlock-items';
import { handleStateApiSyncState } from '@/services/handle-state-api-sync-state';

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
		console.info('start request ----------');
		console.log('Header:', c.req.header());
		console.log('Query session param:', _session);
		console.info('Body:', JSON.stringify(item, null, 2));
		console.info('end request ------------');
		const result = await handleMethod(c, method, jsonrpc, id, params, _session);
		// result.method = method;
		return result;
	}));
	// console.info('Body response:', JSON.stringify(results, null, 2));
	return c.json(results);
	// return c.json(arrayList.length > 1 ? results : results[0]);
});

async function handleMethod(c: Context, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	if (method === 'TrackingApi.getUniqueACId') {
		return await handleTrackingApiGetUniqueACId(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppDatabaseApi.getAppDatabase') {
		return await handleAppDatabaseApiGetAppDatabase(c, method, jsonrpc, id, params, session);
	} else if (method === 'ApplicationSettingsApi.getSettings') {
		return await handleApplicationSettingsApiGetSettings(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppKingAccountApi.getCurrentAccount') {
		return await handleAppKingAccountApiGetCurrentAccount(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppApi.notifyAppStart') {
		return await handleAppApiNotifyAppStart(c, method, jsonrpc, id, params, session);
	} else if (method === 'OtaApi.selectPackageDescriptors') {
		return await handleOtaApiSelectPackageDescriptors(c, method, jsonrpc, id, params, session);
	} else if (method === 'PushNotificationTokenApi.updatePushNotificationToken2') {
		return await handlePushNotificationTokenApiUpdatePushNotificationToken2(c, method, jsonrpc, id, params);
	} else if (method === 'AppCoreIdentityApi.logIn') {
		return await handleAppCoreIdentityApiLogIn(c, method, jsonrpc, id, params);
	} else if (method === 'ServerAuthLiveOpsApi.getLiveOps') {
		return await handleServerAuthLiveOpsApiGetLiveOps(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppAbTestApi.getAppUserAbCases') {
		return await handleAppAbTestApiGetAppUserAbCases(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppKingAccountApi.acceptTermsOfServiceAndPrivacyPolicy') {
		return await handleAppKingAccountApiAcceptTermsOfServiceAndPrivacyPolicy(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppCoreIdentityApi.getAuthenticationInfo') {
		return await handleAppCoreIdentityApiGetAuthenticationInfo(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppPermissionsApi.getConsents3') {
		return await handleAppPermissionsApiGetConsents3(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppTimeApi.getServerTime') {
		return await handleAppTimeApiGetServerTime(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppCommonCatalogApi.getCatalog') {
		return await handleAppCommonCatalogApiGetCatalog(c, method, jsonrpc, id, params, session);
	} else if (method === 'ConfigApi.getConfigEntriesCached') {
		return await handleConfigApiGetConfigEntriesCached(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppClientCrashReport.trackCrashReport') {
		return await handleAppClientCrashReportTrackCrashReport(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.getCommonGuildSettings') {
		return await handleMiloGuildApiGetCommonGuildSettings(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.getMyGuild') {
		return await handleMiloGuildApiGetMyGuild(c, method, jsonrpc, id, params, session);
	} else if (method === 'UnlockApi.unlockBuildings') {
		return await handleUnlockApiUnlockBuildings(c, method, jsonrpc, id, params, session);
	} else if (method === 'StateApi.syncState') {
		return await handleStateApiSyncState(c, method, jsonrpc, id, params, session);
	} else if (method === 'ShopApi.loadProducts') {
		return await handleShopApiLoadProducts(c, method, jsonrpc, id, params, session);
	} else if (method === 'RunnerApi.playerDeath') {
		return await handleRunnerApiPlayerDeath(c, method, jsonrpc, id, params, session);
	} else if (method === 'RunnerApi.endCollectionRun') {
		return await handleRunnerApiEndCollectionRun(c, method, jsonrpc, id, params, session);
	} else if (method === 'ShopApi.deliverOpenTransactions') {
		return await handleShopApiDeliverOpenTransactions(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.getGuildJoinCooldownLeft') {
		return await handleMiloGuildApiGetGuildJoinCooldownLeft(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.suggestGuilds2') {
		return await handleMiloGuildApiSuggestGuilds2(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.createGuild') {
		return await handleMiloGuildApiCreateGuild(c, method, jsonrpc, id, params, session);
	} else if (method === 'ShopApi.purchaseProduct') {
		return await handleShopApiPurchaseProduct(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloSeasonApi.spendTeamRunTicket') {
		return await handleMiloSeasonApiSpendTeamRunTicket(c, method, jsonrpc, id, params, session);
	} else if (method === 'RunnerApi.endRun') {
		return await handleRunnerApiEndRun(c, method, jsonrpc, id, params, session);
	} else if (method === 'PackApi.claimPack') {
		return await handlePackApiClaimPack(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppEmailAndPasswordIdentityApi.authenticate') {
		return await handleAppDatabaseApiGetAppDatabase(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppEmailAndPasswordIdentityApi.link') {
		return await handleAppEmailAndPasswordIdentityApiLink(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.startProducer') {
		return await handleProductionApiStartProducer(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.collectProducer') {
		return await handleProductionApiCollectProducer(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProgressApi.levelUpPlayer') {
		return await handleProgressApiLevelUpPlayer(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProfileApi.setPlayerActiveSkin') {
		return await handleProfileApiSetPlayerActiveSkin(c, method, jsonrpc, id, params, session);
	} else if (method === 'UnlockApi.unlockLand') {
		return await handleUnlockApiUnlockLand(c, method, jsonrpc, id, params, session);
	} else if (method === 'UnlockApi.unlockItems') {
		return await handleUnlockApiUnlockItems(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProgressApi.startTutorial') {
		return await handleProgressApiStartTutorial(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.upgradeBuilding') {
		return await handleProductionApiUpgradeBuilding(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.speedUpProducer') {
		return await handleProductionApiSpeedUpProducer(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProgressApi.finishedTutorial') {
		return await handleProgressApiFinishedTutorial(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.buyProducer') {
		return await handleProductionApiBuyProducer(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.searchGuilds') {
		return await handleMiloGuildApiSearchGuilds(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppStoreApi.createJournal4') {
		return await handleAppStoreApiCreateJournal4(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.getGuild') {
		return await handleMiloGuildApiGetGuild(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.joinGuild') {
		return await handleMiloGuildApiJoinGuild(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.reportAbusiveContent') {
		return await handleMiloGuildApiReportAbusiveContent(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProfileApi.getPlayerStats') {
		return await handleProfileApiGetPlayerStats(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProfileApi.reportPlayer') {
		return await handleProfileApiReportPlayer(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.kickMember') {
		return await handleMiloGuildApiKickMember(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppEmailAndPasswordIdentityApi.checkPassword') {
		return await handleAppEmailAndPasswordIdentityApiCheckPassword(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppEmailAndPasswordIdentityApi.resetPassword') {
		return await handleAppEmailAndPasswordIdentityApiResetPassword(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppCoreIdentityApi.signUp') {
		return await handleAppCoreIdentityApiSignUp(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppCoreIdentityApi.authenticate') {
		return await handleAppCoreIdentityApiAuthenticate(c, method, jsonrpc, id, params, session);
	} else if (method === 'AdsApi.egpPurchase') {
		return await handleAdsApiEgpPurchase(c, method, jsonrpc, id, params, session);
	} else if (method === 'UnlockApi.unlockIsland') {
		return await handleUnlockApiUnlockIsland(c, method, jsonrpc, id, params, session);
	} else if (method === 'QuestApi.reportQuestProgress') {
		return await handleQuestApiReportQuestProgress(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.startProducerMissingResources') {
		return await handleProductionApiStartProducerMissingResources(c, method, jsonrpc, id, params, session);
	} else if (method === 'MiloGuildApi.leaveGuild') {
		return await handleMiloGuildApiLeaveGuild(c, method, jsonrpc, id, params, session);
	} else if (method === 'GroupChatApi.poll') {
		return await handleGroupChatApiPoll(c, method, jsonrpc, id, params, session);
	} else if (method === 'GroupChatApi.postAndPoll') {
		return await handleGroupChatApiPostAndPoll(c, method, jsonrpc, id, params, session);
	} else if (method === 'GroupChatApi.reportAbusiveMessage') {
		return await handleGroupChatApiReportAbusiveMessage(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.upgradeBuildingMissingResources') {
		return await handleProductionApiUpgradeBuildingMissingResources(c, method, jsonrpc, id, params, session);
	} else if (method === 'StateApi.completeState') {
		console.log('StateApi.completeState');
	} else if (method === 'AppKingAccountApi.updateCurrentAccount') {
		return await handleAppKingAccountApiUpdateCurrentAccount(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppEmailAndPasswordIdentityApi.updateEmailAddress') {
		return await handleAppEmailAndPasswordIdentityApiUpdateEmailAddress(c, method, jsonrpc, id, params, session);
	} else if (method === 'AppEmailAndPasswordIdentityApi.updatePassword') {
		return await handleAppEmailAndPasswordIdentityApiUpdatePassword(c, method, jsonrpc, id, params, session);
	} else if (method === 'ProductionApi.buyProducerMissingResources') {
		return await handleProductionApiBuyProducerMissingResources(c, method, jsonrpc, id, params, session);
	} else if (method === 'InventoryApi.sellItems') {
		return await handleInventoryApiSellItems(c, method, jsonrpc, id, params, session);
	} else {
		console.error('Method not implemented:', method);
		return { error: 'Method not implemented' };
	}
}
