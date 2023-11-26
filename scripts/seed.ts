import {
	clearSupabaseData,
	createContact,
	createUser,
	startSupabase,
	syncStripeProducts
} from './utils';

async function seed() {
	try {
		await startSupabase();
		await clearSupabaseData();
		await syncStripeProducts();
		const user = await createUser({
			email: 'mark@me.com',
			full_name: 'Mark Test User',
			password: 'password'
		});

		for (let i = 0; i < 5; i++) {
			await createContact(user.id);
		}
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
	process.exit();
}
seed();
