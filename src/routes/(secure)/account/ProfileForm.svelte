<script lang="ts">
	import UserIcon from '$lib/components/icons/UserIcon.svelte';
	import { Button } from 'flowbite-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ProfileSchema } from '$lib/schemas';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: SuperValidated<ProfileSchema>;
	const { form, errors, enhance } = superForm(data);
</script>

<section class="px-6 pt-16">
	<div class="flex items-center font-semibold">
		<UserIcon />
		<span class="ml-4">Personal Details</span>
	</div>
	<p class="mt-3 text-sm">Change the personal details associated with your account</p>
	<!-- Personal Details Form -->
	<form class="mt-8" method="post" action="?/update-profile" use:enhance>
		<label for="full_name" class="space-y-2">
			<span>Name</span>
			<input type="text" name="full_name" bind:value={$form.full_name} />
			{#if $errors.full_name}
				<span class="block text-red-600 dark:text-red-500">{$errors.full_name}</span>
			{/if}
		</label>
		<Button color="blue" type="submit" class="mt-4">Update Details</Button>
	</form>
</section>
