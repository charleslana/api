import { GenericResponse } from '@/interfaces/generic-response';

export function returnGenericResponse(jsonrpc: string, id: number) {
	const response: GenericResponse = {
		jsonrpc,
		id,
		result: {
			resultCode: 200,
			stateUpdateOutcome: 'SUCCESS',
			responseStatus: 'OK',
		},
	}
	return response;
}
