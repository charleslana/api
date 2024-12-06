import { GenericSuccess } from '@/interfaces/generic-success';

export function returnGenericSuccess(jsonrpc: string, id: number, resultCode = 1) {
	const response: GenericSuccess = {
		jsonrpc,
		id,
		result: {
			resultCode,
			stateUpdateOutcome: 'SUCCESS',
			responseStatus: 'OK',
		},
	}
	return response;
}
