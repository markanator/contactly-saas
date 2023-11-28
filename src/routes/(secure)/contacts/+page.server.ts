import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { createContactSchema, deleteContactSchema } from '$lib/schemas';
import { supabaseAdmin } from '$lib/server/supabase-admin';
import { getSubscriptionTier } from '$lib/server/stripe/subscriptions';
import { getContactsCount } from '$lib/server/contacts';
import { handleLoginRedirect, hasReachedMaxContacts } from '$lib/helpers';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		throw redirect(302, handleLoginRedirect(event));
	}

	async function getContacts() {
		const { data: contacts, error: contactsError } = await event.locals.supabase
			.from('contacts')
			.select('*')
			.limit(10);

		if (contactsError) {
			throw error(500, 'Error fetching contacts, please try again later.');
		}
		return contacts;
	}
	return {
		createContactForm: superValidate(createContactSchema, {
			id: 'create'
		}),
		contacts: getContacts(),
		deleteContactForm: superValidate(deleteContactSchema, {
			id: 'delete'
		}),
		tier: getSubscriptionTier(session.user.id),
		contactsCount: getContactsCount(session.user.id)
	};
};

export const actions: Actions = {
	createContact: async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		// prevent users from creating more contacts than their tier allows
		const [tier, count, createContactForm] = await Promise.all([
			getSubscriptionTier(session.user.id),
			getContactsCount(session.user.id),
			superValidate(event, createContactSchema, {
				id: 'create'
			})
		]);

		if (hasReachedMaxContacts(tier, count)) {
			throw error(
				403,
				'You have reached the max number of contacts for your tier. Please upgrade.'
			);
		}

		if (!createContactForm.valid) {
			return fail(400, {
				createContactForm
			});
		}

		const { error: createContactError } = await supabaseAdmin.from('contacts').insert({
			...createContactForm.data,
			user_id: session.user.id
		});

		if (createContactError) {
			console.log(createContactError);
			return setError(createContactForm, 'Error creating contact.');
		}

		return {
			createContactForm
		};
	},
	deleteContact: async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const deleteContactForm = await superValidate(event.url, deleteContactSchema, {
			id: 'delete'
		});

		if (!deleteContactForm.valid) {
			return fail(400, {
				deleteContactForm
			});
		}

		const { error: deleteContactError } = await event.locals.supabase
			.from('contacts')
			.delete()
			.eq('id', deleteContactForm.data.id);

		if (deleteContactError) {
			return setError(deleteContactForm, 'Error deleting contact');
		}

		return {
			deleteContactForm
		};
	}
};
