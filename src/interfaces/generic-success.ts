export interface GenericSuccess {
	jsonrpc: string;
	id: number;
	result: {
		resultCode?: number;
		stateUpdateOutcome: string;
		responseStatus?: string;
	};
}
