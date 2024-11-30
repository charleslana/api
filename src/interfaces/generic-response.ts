export interface GenericResponse {
	jsonrpc: string;
	id: number;
	result: {
		resultCode?: number;
		stateUpdateOutcome: string;
		responseStatus?: string;
	};
}
