import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { config } from 'dotenv';

config({ path: '.env' });

console.log(process.env.DATABASE_URL);

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool);

const main = async () => {
	try {
		await migrate(db, { migrationsFolder: 'drizzle' });
		console.log('Migrated successfully.');
	} catch (error) {
		console.error(error);
		process.exit(1);
	} finally {
		await pool.end();
	}
};

main().then(r => null);
