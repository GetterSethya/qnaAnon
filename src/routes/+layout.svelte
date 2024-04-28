<script lang="ts">
	import Gear from "$lib/components/svg/gear.svelte";
	import { ResponseToastEnum } from "$lib/enum";
	import {
		computePosition,
		autoUpdate,
		offset,
		shift,
		flip,
		arrow,
	} from "@floating-ui/dom";
	import { enhance } from "$app/forms";
	import Compass from "$lib/components/svg/compass.svelte";
	import DoorOpen from "$lib/components/svg/doorOpen.svelte";
	import Person from "$lib/components/svg/person.svelte";
	import "../app.pcss";
	import {
		getToastStore,
		initializeStores,
		Modal,
		Toast,
		type ModalSettings,
		ProgressRadial,
	} from "@skeletonlabs/skeleton";
	import { getModalStore } from "@skeletonlabs/skeleton";
	import { PageTitle, toastData } from "$lib/stores";
	import { storePopup } from "@skeletonlabs/skeleton";
	import { navigating, page } from "$app/stores";

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	initializeStores();

	const toastStore = getToastStore();
	let toastType: ResponseToastEnum | undefined = ResponseToastEnum.error;
	let buttonLogout: HTMLButtonElement;
	const modalStore = getModalStore();

	const logoutModal = {
		type: "confirm",
		title: "Please Confirm",
		body: "Are you sure want to Logout?",
		response: (r: boolean) => {
			if (r === true) {
				buttonLogout.click();
			}
		},
		buttonTextConfirm: "Logout",
	} satisfies ModalSettings;

	$: if ($toastData?.message) {
		$toastData.message.forEach((d) => {
			toastStore.trigger({
				message: d,
				hoverable: true,
				background: `variant-filled-${
					$toastData.type ? $toastData.type : "error"
				}`,
			});
			toastType = $toastData.type;
		});
	}
</script>

<svelte:head>
	<title>Bertanya sebagai anonim</title>
</svelte:head>

<Toast position="br" background="variant-filled-warning" />
<Modal />

{#if $page.url.pathname.startsWith("/login") || $page.url.pathname.startsWith("/register")}
	<slot />
{:else}
	<div class="min-h-screen max-sm:w-full xl:w-1/2 w-2/3 mx-auto">
		<div class="flex flex-row">
			<!-- desktop menu -->
			<div
				class="border-e border-surface-700 h-screen flex flex-col items-start w-fit px-5 py-1 justify-between sticky top-0 max-sm:hidden"
			>
				<div class="flex flex-col mt-2.5 gap-2">
					<a
						href="/"
						class="fill-surface-100 btn px-2 bg-surface-700 hover:bg-surface-600 rounded-full"
					>
						<Compass />
					</a>
					{#if $page.data?.userData?.id}
						<a
							href={`/${$page.data?.userData?.username}`}
							class="fill-surface-100 btn px-2 bg-surface-700 hover:bg-surface-600 rounded-full"
						>
							<Person />
						</a>
						<a
							href={`/profile/${$page.data?.userData?.username}`}
							class="fill-surface-100 btn px-2 bg-surface-700 hover:bg-surface-600 rounded-full"
						>
							<Gear />
						</a>
					{/if}
				</div>
				{#if $page.data?.userData?.id}
					<div class="mb-20">
						<div style="display: contents;">
							<button
								on:click={() => {
									modalStore.trigger(logoutModal);
								}}
								type="button"
								class="fill-surface-100 btn px-2 bg-surface-700 hover:bg-surface-600 rounded-full"
							>
								<DoorOpen />
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- mobile menu -->

			<div
				class="w-full max-sm:border-e-0 relative border-e dark:border-surface-700"
			>
				<div
					class="py-2.5 border-b dark:border-surface-700 sticky top-0 dark:bg-surface-900"
				>
					<h4 class="h4 font-bold text-center dark:text-surface-100">
						{$PageTitle}
					</h4>
				</div>
				{#if $navigating}
					<div class="flex justify-center min-h-screen items-center">
						<ProgressRadial
							width="w-10"
							meter="stroke-primary-500"
						/>
					</div>
				{:else}
					<slot />
				{/if}
				<div class="max-sm:block hidden">
					<br />
					<br />
					<br />
					<br />
				</div>

				<div
					class="max-sm:block hidden border-t border-surface-700 flex flex-row items-start w-full p-5 justify-between fixed bottom-0 bg-surface-900"
				>
					<div class="flex flex-row grow justify-evenly gap-2">
						<a
							href="/"
							class="fill-surface-100 btn px-2 hover:bg-surface-600 rounded-full"
						>
							<Compass />
						</a>
						{#if $page.data.userData?.id}
							<a
								href={`/${$page.data.userData?.username}`}
								class="fill-surface-100 btn px-2 hover:bg-surface-600 rounded-full"
							>
								<Person />
							</a>
							<a
								href={`/profile/${$page.data.userData?.username}`}
								class="fill-surface-100 btn px-2 hover:bg-surface-600 rounded-full"
							>
								<Gear />
							</a>
							<form
								use:enhance
								style="display: contents;"
								action="/logout?logout"
								method="post"
							>
								<button
									on:click={() => {
										modalStore.trigger(logoutModal);
									}}
									type="button"
									class="fill-surface-100 btn px-2 hover:bg-surface-600 rounded-full"
								>
									<DoorOpen />
								</button>
								<button
									bind:this={buttonLogout}
									type="submit"
									class="fill-surface-100 btn px-2 hover:bg-surface-600 rounded-full hidden"
								>
								</button>
							</form>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
