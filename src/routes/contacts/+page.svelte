<script lang="ts">
	import {
		Button,
		Dropdown,
		DropdownItem,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { DotsVerticalOutline } from 'flowbite-svelte-icons';
	import type { PageData } from './$types';
	import CreateContactModal from './CreateContactModal.svelte';

	export let data: PageData;
	let isCreateModalOpen = false;
	function handleCreateModalToggle() {
		isCreateModalOpen = !isCreateModalOpen;
	}
</script>

<div class="py-20">
	<!-- Contacts Page Header -->
	<div class="flex w-full items-center justify-between pb-6">
		<h1 class="text-3xl">Contacts</h1>
		<Button color="blue" size="sm" on:click={handleCreateModalToggle}>New Contact</Button>
	</div>
	<!-- Contacts Table -->
	<Table shadow divClass="min-h-full">
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Email</TableHeadCell>
			<TableHeadCell>Phone</TableHeadCell>
			<TableHeadCell>Company</TableHeadCell>
			<TableHeadCell />
		</TableHead>
		<TableBody>
			{#each data.contacts as contact, _i (contact.id)}
				<TableBodyRow>
					<TableBodyCell>{contact.name ?? '--'}</TableBodyCell>
					<TableBodyCell>{contact.email ?? '--'}</TableBodyCell>
					<TableBodyCell>{contact.phone ?? '--'}</TableBodyCell>
					<TableBodyCell>{contact.company ?? '--'}</TableBodyCell>
					<TableBodyCell>
						<Button
							color="primary"
							class="dots-menu dark:text-white"
							vertical
							size="xs"
							name="Contact Menu"
						>
							<DotsVerticalOutline class="ring-0 outline-none" />
						</Button>
						<Dropdown placement="left-start">
							<DropdownItem>Edit</DropdownItem>
							<DropdownItem slot="footer">Delete</DropdownItem>
						</Dropdown>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
	<!-- CREATE CONTACT MODAL -->
	<CreateContactModal bind:open={isCreateModalOpen} data={data.contactForm} />
</div>
