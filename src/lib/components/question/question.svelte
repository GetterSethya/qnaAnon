<script lang="ts">
	import ThrashCan from "$lib/components/svg/thrashCan.svelte";
	import ThreeDotsVertical from "$lib/components/svg/threeDotsVertical.svelte";
	import { relativeTime, formatDate } from "$lib/publicHelper";
	import type { question } from "$lib/schema/schema";
	import { ProgressRadial } from "@skeletonlabs/skeleton";
	import DropdownMenu from "../dropdownMenu.svelte";
	import { toastData } from "$lib/stores";
	import { ResponseToastEnum } from "$lib/enum";

	export let q: typeof question.$inferSelect;
	export let userId: string | null = null;

	export let callback: Function = () => {};
	const questionState = {
		show: false,
		waitingResult: false,
	};
</script>

<div class="text-surface-300 p-5 bg-surface-800 rounded-lg flex flex-col gap-4">
	<div class="flex flex-row justify-between items-end">
		<div class="flex flex-col gap-2">
			{#if q.visibility === "false"}
				<span
					class="p-1 rounded-lg variant-ghost-primary flex w-fit px-2 font-bold max-sm:text-xs"
				>
					<small> Private </small>
				</span>
			{/if}
			<p class="font-bold max-sm:text-sm pb-2">From: {q.name}</p>
		</div>

		<div class="flex flex-row gap-2 items-end">
			{#if userId && q.userId === userId}
				<DropdownMenu
					bind:show={questionState.show}
					optionPositions="right-0"
				>
					<button
						class="btn rounded px-1 fill-surface-300"
						slot="menu"
					>
						<ThreeDotsVertical />
					</button>
					<svelte:fragment slot="options">
						<button
							on:click={async () => {
								questionState.waitingResult = true;
								await fetch(
									`/api/v1/questions/?userId=${userId}&qId=${q.id}`,
									{
										method: "DELETE",
									},
								)
									.then((res) => {
										if (res.status === 200) {
											const toast = {
												message: ["Question deleted"],
												type: ResponseToastEnum.primary,
											};

											$toastData = toast;
											callback();
										} else {
											const toast = {
												message: [
													"Failed when deleting question",
												],
												type: ResponseToastEnum.error,
											};

											$toastData = toast;
										}
									})
									.catch(() => {
										console.log(
											"Error when deleting questions, please try again",
										);
										const toast = {
											message: [
												"Failed when deleting question",
											],
											type: ResponseToastEnum.error,
										};

										$toastData = toast;
									})
									.finally(() => {
										questionState.waitingResult = false;
										questionState.show = false;
									});
							}}
							class="bg-surface-800 p-2.5 flex flex-row gap-2 items-center hover:bg-surface-700 fill-primary-500 font-bold hover:text-white"
							disabled={questionState.waitingResult}
						>
							{#if questionState.waitingResult}
								<div
									class="flex flex-col rounded-xl items-center justify-center"
								>
									<ProgressRadial
										width="w-4"
										meter="stroke-primary-500"
									/>
								</div>
							{:else}
								<ThrashCan />
							{/if}
							<span>Delete</span>
						</button>
					</svelte:fragment>
				</DropdownMenu>
			{/if}
		</div>
	</div>
	<article>
		{q.body}
	</article>
	<p class="text-surface-400 max-sm:text-sm">
		<small>
			{relativeTime(new Date(q.createdAt))}
			{formatDate(new Date(q.createdAt))}
		</small>
	</p>
</div>
