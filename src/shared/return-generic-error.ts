import { GenericError } from '@/interfaces/generic-error';

export function returnGenericError(jsonrpc: string, id: number, resultCode = -1002) {
	const response: GenericError = {
		jsonrpc,
		id,
		result: {
			resultCode,
			resultMessage: 'Error',
		},
	};
	return response;
}
