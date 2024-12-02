export const searchGuildStateUtils = {
	guildId: 1,
	name: 'Test',
	description: 'Description guild',
	numMembers: 1,
	editableProperties: [
		{
			name: 'badgeId',
			value: '1',
		},
	],
	computedProperties: [
		{ name: 'memberPowerGemsAvg', value: '0' },
		{ name: 'leagueId', value: '0' },
		{ name: 'leaderboardPosition', value: '1' },
		{ name: 'activityLevel', value: '5' },
		{ name: 'crashPoints', value: '0' },
	],
	internalProperties: [{ name: 'chatId', value: '1' }],
	members: [
		{
			coreUserId: 1,
			status: 2,
			editableProperties: [],
			computedProperties: [
				{ name: 'guildMemberName', value: 'displayName' },
				{ name: 'memberActiveSkinId', value: 81605 },
				{ name: 'contributedCrashPoints', value: '0' },
			],
			internalProperties: [],
		},
	],
};
