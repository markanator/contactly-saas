import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession } from '$lib/server/stripe/subscriptions';

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		throw redirect(302, '/login');
	}
	// use query strings for other options
	const price_id = event.url.searchParams.get('id');
	if (!price_id) {
		throw error(400, 'Invalid request');
	}

	let checkoutUrl: string;

	try {
		checkoutUrl = await createCheckoutSession(session.user.id, price_id);
	} catch (e) {
		console.log(e);
		throw error(500, 'An error occurred while creating the checkout session.');
	}

	throw redirect(302, checkoutUrl);
};
