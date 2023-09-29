import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { emailSchema, passwordSchema, profileSchema } from '$lib/schemas';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		throw redirect(302, '/login');
	}
	async function getUserProfile() {
		const { data: profile, error: profileError } = await event.locals.supabase
			.from('profiles')
			.select('*') // this is ok because we've setup row level security
			.limit(1)
			.single();
		if (profileError) {
			throw error(500, 'Error fetching profile');
		}
		return profile;
	}
	return {
		profileForm: superValidate(await getUserProfile(), profileSchema, {
			id: 'profileForm'
		}),
		emailForm: superValidate({ email: session.user.email }, emailSchema, {
			id: 'emailForm'
		}),
		passwordForm: superValidate(passwordSchema, {
			id: 'password'
		})
	};
};
