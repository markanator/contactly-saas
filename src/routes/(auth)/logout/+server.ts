import { error, redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
	const { error: logoutError } = await event.locals.supabase.auth.signOut();
	if (logoutError) {
		throw error(500, logoutError.message ?? "Couldn't log out");
	}
	throw redirect(302, '/login');
};
