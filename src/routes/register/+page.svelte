<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { ProgressRadial } from "@skeletonlabs/skeleton";
	import type { ActionData } from "./$types";
	import { toastData } from "$lib/stores";
	import { goto } from "$app/navigation";
	let waitingResult = false;

	export let form: ActionData;
	$: toast = {
		message: form?.message,
		type: form?.type,
	};

	$: $toastData = toast;
</script>

<div class="min-h-screen flex">
	<div class="m-auto max-sm:w-2/3 md:w-1/3 lg:w-1/4 xl:w-1/5">
		<h4 class="h3 font-medium py-5 text-center">Create your account</h4>

		<form
			use:enhance={() => {
				waitingResult = true;
				return async ({ result }) => {
					if (result.type === "redirect") {
						goto(result.location);
					} else {
						await applyAction(result);
					}

					waitingResult = false;
				};
			}}
			action="?register"
			method="POST"
			class="flex flex-col w-full gap-2"
		>
			<input
				class="bg-transparent dark:border-surface-600 border-surface-300 border rounded-xl p-2.5 px-5 outline-none"
				type="text"
				name="inputName"
				id="inputName"
				placeholder="Full name"
				disabled={waitingResult}
				required
			/>
			<input
				class="bg-transparent dark:border-surface-600 border-surface-300 border rounded-xl p-2.5 px-5 outline-none"
				type="text"
				name="inputUsername"
				id="inputUsername"
				placeholder="Username"
				disabled={waitingResult}
				required
			/>
			<input
				class="bg-transparent dark:border-surface-600 border-surface-300 border rounded-xl p-2.5 px-5 outline-none"
				type="email"
				name="inputEmail"
				id="email"
				placeholder="Email"
				disabled={waitingResult}
				required
			/>
			<input
				class="bg-transparent dark:border-surface-600 border-surface-300 border rounded-xl p-2.5 px-5 outline-none"
				type="password"
				name="inputPassword"
				id="password"
				placeholder="Password"
				disabled={waitingResult}
				required
			/>
			<input
				class="bg-transparent dark:border-surface-600 border-surface-300 border rounded-xl p-2.5 px-5 outline-none"
				type="password"
				name="inputConfirmPassword"
				id="inputConfirmPassword"
				placeholder="Confirm your password"
				disabled={waitingResult}
				required
			/>
			<button
				disabled={waitingResult}
				type="submit"
				class="btn variant-filled-primary rounded-xl font-medium gap-2"
				>Register
				{#if waitingResult}
					<ProgressRadial
						width="w-4"
						meter="stroke-surface-100 dark:stroke-surface-900"
					/>
				{/if}
			</button>
		</form>
		<div class="flex flex-row justify-between py-5 w-full">
			<p class="text-surface-400">
				<small>
					<a class="text-primary-500" href="/login">Login</a>
				</small>
			</p>
			<!-- <p class="text-surface-400"> -->
			<!-- 	<small> -->
			<!-- 		<a class="text-primary-500" href="/password_reset" -->
			<!-- 			>Forgot your password? -->
			<!-- 		</a> -->
			<!-- 	</small> -->
			<!-- </p> -->
		</div>
	</div>
</div>
