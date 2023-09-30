import detect from 'detect-port';
import { execSync } from 'child_process';
import pg from 'pg';
import { ENV } from '$lib/server/env';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase-types';
import type { z } from 'zod';
import type { registerUserSchema } from '$lib/schemas';

const DEFAULT_PG_PORT = 54322;

export async function startSupabase() {
	const port = await detect(DEFAULT_PG_PORT);

	if (port !== DEFAULT_PG_PORT) {
		return;
	}
	// if its not running, start it
	execSync('pnpx supabase start');
}

export async function clearSupabaseData() {
	const client = new pg.Client({
		connectionString: ENV.SUPABASE_DB_URL
	});
	await client.connect();
	await client.query('TRUNCATE auth.users CASCADE');
}

const supabase = createClient<Database>(ENV.PUBLIC_SUPABASE_URL, ENV.PUBLIC_SUPABASE_ANON_KEY);

type CreateUser = Omit<z.infer<typeof registerUserSchema>, 'passwordConfirm'>;

export async function createUser(user: CreateUser) {
	const { data: authData, error: authError } = await supabase.auth.signUp({
		email: user.email,
		password: user.password,
		options: {
			data: {
				full_name: user.full_name ?? 'Test User'
			}
		}
	});

	if (authError || !authData.user) {
		throw new Error('Error creating user');
	}
	return authData.user;
}
