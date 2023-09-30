import { clearSupabaseData, createUser, startSupabase } from './utils';

async function seed() {
	try {
		await startSupabase();
		await clearSupabaseData();
		await createUser({ email: 'mark@me.com', full_name: 'Mark Test User', password: 'password' });
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
	process.exit();
}
seed();
