import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { setError, superValidate } from 'sveltekit-superforms/server';
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

export const actions: Actions = {
	'update-profile': async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}
		const profileForm = await superValidate(event, profileSchema, {
			id: 'profileForm'
		});
		if (!profileForm.valid) {
			throw fail(400, {
				profileForm
			});
		}

		const { error: profileError } = await event.locals.supabase
			.from('profiles')
			.update(profileForm.data)
			.eq('id', session.user.id);
		if (profileError) {
			return setError(profileForm, 'Error updating profile');
		}
		return {
			profileForm
		};
	},
	'update-email': async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}
		const emailForm = await superValidate(event, emailSchema, {
			id: 'emailForm'
		});
		if (!emailForm.valid) {
			throw fail(400, {
				emailForm
			});
		}
		const { error: emailError } = await event.locals.supabase.auth.updateUser({
			email: emailForm.data.email
		});
		if (emailError) {
			return setError(emailForm, 'email', 'Error updating email');
		}

		return {
			emailForm
		};
	},
	'update-password': async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}
		const passwordForm = await superValidate(event, passwordSchema, {
			id: 'passwordForm'
		});
		if (!passwordForm.valid) {
			throw fail(400, {
				passwordForm
			});
		}

		if (passwordForm.data.password !== passwordForm.data.passwordConfirm) {
			return setError(passwordForm, 'passwordConfirm', 'Passwords do not match');
		}

		const { error: passwordError } = await event.locals.supabase.auth.updateUser({
			password: passwordForm.data.password
		});

		if (passwordError) {
			return setError(passwordForm, 'Error updating password');
		}

		return {
			passwordForm
		};
	}
};
