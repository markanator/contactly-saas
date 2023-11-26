import { stripeProductSchema } from '$lib/schemas';
import type Stripe from 'stripe';
import { supabaseAdmin } from '$lib/server/supabase-admin';

export async function upsertProductRecord(stripeProduct: Stripe.Product) {
	const product = stripeProductSchema.parse(stripeProduct);
	// no user interaction, just third party data
	const { error } = await supabaseAdmin.from('billing_products').upsert(product);

	if (error) {
		throw error;
	}
}

export async function deleteProductRecord(stripeProduct: Stripe.Product) {
	const { error } = await supabaseAdmin
		.from('billing_products')
		.delete()
		.eq('id', stripeProduct.id);

	if (error) {
		throw error;
	}
}
