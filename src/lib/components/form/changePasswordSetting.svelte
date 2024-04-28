<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { toastData } from "$lib/stores";
	import { ProgressRadial } from "@skeletonlabs/skeleton";
	import type { ActionData } from "../../../routes/profile/[username]/$types";

	export let form: ActionData;
	export let username: string;

	$: toast = {
		message: form?.message,
		type: form?.type,
	};

	$: $toastData = toast;

	let waitingResult: boolean = false;
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
	action={`/profile/${username}?/changePassword`}
	method="post"
	class="py-2.5 flex flex-col gap-4"
>
	<div class="flex flex-col gap-2">
		<label for="currentPassword">Current Password</label>
		<input
			type="password"
			name="inputPassword"
			id="inputPassword"
			class="p-2.5 px-5 bg-transparent border border-surface-700 rounded-xl outline-none"
			disabled={waitingResult}
			required
		/>
	</div>
	<div class="flex flex-col gap-2">
		<label for="newPassword">New Password</label>
		<input
			type="password"
			name="inputNewPassword"
			id="inputNewPassword"
			class="p-2.5 bg-transparent border px-5 border-surface-700 rounded-xl outline-none"
			disabled={waitingResult}
			required
		/>
	</div>
	<div class="flex flex-col gap-2">
		<label for="confirmPassword">Confirm Password</label>
		<input
			type="password"
			name="inputConfirmPassword"
			id="inputConfirmPassword"
			class="p-2.5 bg-transparent border px-5 border-surface-700 rounded-xl outline-none"
			disabled={waitingResult}
			required
		/>
	</div>

	<button
		type="submit"
		class="btn flex gap-2 w-fit ms-auto rounded-xl variant-filled-primary"
		disabled={waitingResult}
	>
		{#if waitingResult}
			<ProgressRadial width="w-4" meter="stroke-surface-100 " />
		{/if}
		Update password
	</button>
</form>
