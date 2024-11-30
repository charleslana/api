export interface GenericError {
	jsonrpc: string;
	id: number;
	result: {
		resultCode: number;
		resultMessage: string;
	};
}
