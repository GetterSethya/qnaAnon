<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import type { ActionData } from "../../../routes/profile/[username]/$types";
	import { toastData } from "$lib/stores";
	import {} from "os";
	import { goto } from "$app/navigation";
	import { ProgressRadial } from "@skeletonlabs/skeleton";
	export let name: string;
	export let username: string;
	export let email: string;
	export let bio: string | null;
	export let form: ActionData;

	let waitingResult: boolean = false;
	$: toast = {
		message: form?.message,
		type: form?.type,
	};

	$: $toastData = toast;
</script>

<form
	use:enhance={() => {
		waitingResult = true;
		return async ({ result }) => {
			if (result.type === "redirect") {
				goto(result.location);
			}

			waitingResult = false;
			await applyAction(result);
		};
	}}
	action={`/profile/${username}?/updateProfile`}
	method="post"
	class="py-2.5 flex flex-col gap-4"
>
	<div class="flex flex-col gap-2">
		<label for="name">Nama user</label>
		<input
			type="text"
			name="inputName"
			id="inputName"
			class="p-2.5 px-5 bg-transparent border border-surface-700 rounded-xl outline-none"
			value={name}
			disabled={waitingResult}
		/>
	</div>
	<div class="flex flex-col gap-2">
		<label for="email">Email</label>
		<input
			type="email"
			name="inputEmail"
			id="inputEmail"
			class="p-2.5 bg-transparent border px-5 border-surface-700 rounded-xl outline-none"
			value={email}
			disabled={waitingResult}
		/>
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-2">
			<label for="bio">Bio</label>
			<p class="ms-auto">
				<small>0/250</small>
			</p>
		</div>
		<textarea
			disabled={waitingResult}
			name="inputBio"
			id="inputBio"
			maxlength="250"
			class="bg-transparent rounded-xl w-full border border-surface-700 p-2.5 px-5 outline-none min-h-[10em] max-h-[10em]"
			>{bio ?? ""}</textarea
		>
	</div>

	<button
		disabled={waitingResult}
		type="submit"
		class="btn w-fit ms-auto rounded-xl variant-filled-primary flex gap-2"
	>
		{#if waitingResult}
			<ProgressRadial width="w-4" meter="stroke-surface-100 " />
		{/if}
		Update profile
	</button>
</form>
