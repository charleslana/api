import type { Database } from '@/db/middleware';

export type Env = {
	DATABASE_URL: string;
};

export type Variables = {
	db: Database;
};
