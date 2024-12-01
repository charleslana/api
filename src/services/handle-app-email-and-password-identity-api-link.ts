import { Context } from 'hono';
import type { Env, Variables } from '@/lib/types';
import { returnGenericError } from '@/shared/return-generic-error';
import { findUserByEmail, findUserByName, generateUserName, hashPassword } from '@/routes/user';
import { inventories, skins, users } from '@/db/schema';
import { generateToken, validateEmail } from '@/utils/utils';

export async function handleAppEmailAndPasswordIdentityApiLink(c: Context<{
	Bindings: Env, Variables: Variables
}>, method: string, jsonrpc: string, id: number, params: any[], session?: string) {
	const db = c.get('db');
	try {
		const email = params[0] as string;
		const password = params[1] as string;
		if (!email || !password || !validateEmail(email) || email.length > 50) {
			return returnGenericError(jsonrpc, id);
		}
		const name = generateUserName();
		const [existingEmail, existingName] = await Promise.all([
			findUserByEmail(c, email),
			findUserByName(c, name)
		]);
		if (existingEmail || existingName) {
			return returnGenericError(jsonrpc, id);
		}
		const passwordHash = await hashPassword(password);
		const signUpToken = generateToken();
		const [newUser] = await db.insert(users).values({
			email, password: passwordHash, name, signUpToken
		}).returning();
		await Promise.all([
			db.insert(inventories).values({
				itemTypeId: 81000,
				count: 5000,
				userId: newUser.id
			}),
			db.insert(skins).values([
				{ characterId: 81282, skinId: 81329, userId: newUser.id },
				{ characterId: 81283, skinId: 81330, userId: newUser.id },
				{ characterId: 81282, skinId: 81331, userId: newUser.id },
				{ characterId: 81282, skinId: 81332, userId: newUser.id },
				{ characterId: 81282, skinId: 81333, userId: newUser.id },
				{ characterId: 81282, skinId: 81334, userId: newUser.id },
				{ characterId: 81283, skinId: 81335, userId: newUser.id },
				{ characterId: 81283, skinId: 81336, userId: newUser.id },
				{ characterId: 81283, skinId: 81337, userId: newUser.id },
				{ characterId: 81283, skinId: 81338, userId: newUser.id },

				{ characterId: 81282, skinId: 81339, userId: newUser.id },
				{ characterId: 81283, skinId: 81340, userId: newUser.id },
				{ characterId: 81282, skinId: 81341, userId: newUser.id },
				{ characterId: 81283, skinId: 81342, userId: newUser.id },
				{ characterId: 81282, skinId: 81343, userId: newUser.id },
				{ characterId: 81283, skinId: 81344, userId: newUser.id },
				{ characterId: 81282, skinId: 81345, userId: newUser.id },
				{ characterId: 81283, skinId: 81346, userId: newUser.id },
				{ characterId: 81283, skinId: 81347, userId: newUser.id },
				{ characterId: 81282, skinId: 81374, userId: newUser.id },
			]),
		]);
		return  {
			jsonrpc,
			id,
			result: {
				resultCode: 1,
				resultMessage: 'Created account',
				coreUserId: newUser.id,
				signUpToken,
			},
		};
	} catch (error) {
		console.error(`Erro no método ${method}: ${error}`);
		return returnGenericError(jsonrpc, id);
	}
}
