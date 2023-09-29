<script lang="ts">
	import LockIcon from '$lib/components/icons/LockIcon.svelte';
	import type { PasswordSchema } from '$lib/schemas';
	import { Button } from 'flowbite-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: SuperValidated<PasswordSchema>;
	const { form, errors, enhance } = superForm(data);
</script>

<section class="px-6 pt-16">
	<div class="flex items-center font-semibold">
		<LockIcon />
		<span class="ml-4">Password</span>
	</div>
	<p class="mt-3 max-w-none text-sm">Change the password associated with your account</p>
	<!-- Change Password Form -->
	<form class="mt-8 flex flex-col space-y-4" use:enhance method="post" action="?/update-password">
		<label for="password" class="space-y-2">
			<span>New Password</span>
			<input type="password" name="password" bind:value={$form.password} />
			{#if $errors.password}
				<span class="block text-red-600 dark:text-red-500">{$errors.password}</span>
			{/if}
		</label>
		<label for="passwordConfirm" class="space-y-2">
			<span>Confirm New Password</span>
			<input type="password" name="passwordConfirm" bind:value={$form.passwordConfirm} />
			{#if $errors.passwordConfirm}
				<span class="block text-red-600 dark:text-red-500">{$errors.passwordConfirm}</span>
			{/if}
		</label>
		<Button color="blue" type="submit" class="mt-4 self-start">Change Password</Button>
	</form>
</section>
