import { GenericResponse } from '@/interfaces/generic-response';

export function returnGenericResponse(jsonrpc: string, id: number, resultCode = 1) {
	const response: GenericResponse = {
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
