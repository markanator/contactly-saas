import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { createContactSchema } from '$lib/schemas';
import { handleLoginRedirect } from '$lib/helpers';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		throw redirect(302, handleLoginRedirect(event));
	}

	async function getContact(contact_id: string) {
		const { error: contactError, data: contact } = await event.locals.supabase
			.from('contacts')
			.select('*')
			.eq('id', contact_id)
			.limit(1)
			.maybeSingle();

		if (contactError) {
			throw error(500, 'Error fetching contact. Please try again later.');
		}
		if (!contact) {
			throw error(404, 'Contact not found.');
		}
		return contact;
	}
	return {
		updateContactForm: superValidate(await getContact(event.params.contactId), createContactSchema)
	};
};

export const actions: Actions = {
	'update-contact': async (event) => {
		const session = await event.locals.getSession();
		if (!session || !event.params.contactId) {
			throw error(401, 'Unauthorized');
		}

		const updateContactForm = await superValidate(event, createContactSchema);

		if (!updateContactForm.valid) {
			return fail(400, {
				updateContactForm
			});
		}

		const { error: updateContactError } = await event.locals.supabase
			.from('contacts')
			.update(updateContactForm.data)
			.eq('id', event.params.contactId);

		if (updateContactError) {
			return setError(updateContactForm, 'Error updating contact, please try again later.');
		}

		return {
			updateContactForm
		};
	}
};
