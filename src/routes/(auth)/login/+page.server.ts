import { setError, superValidate } from 'sveltekit-superforms/server';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';
import type { PageServerLoad } from './$types';
import { loginUserSchema } from '$lib/schemas';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.getSession();
	if (session) {
		throw redirect(302, '/');
	}

	return {
		form: superValidate(loginUserSchema)
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, loginUserSchema);
		if (!form.valid) {
			return fail(400, { form });
		}
		const { error: AuthError } = await event.locals.supabase.auth.signInWithPassword(form.data);
		if (AuthError) {
			if (AuthError instanceof AuthApiError && AuthError.status === 400) {
				setError(form, 'email', 'Invalid credentials');
				setError(form, 'password', 'Invalid credentials');
				return fail(400, { form });
			}
		}
		throw redirect(302, '/');
	}
};
