<script lang="ts">
	import QuestionPageNumber from "$lib/components/question/questionPageNumber.svelte";
	import Question from "$lib/components/question/question.svelte";
	import DropdownMenu from "$lib/components/dropdown/dropdownMenu.svelte";
	import DescSort from "$lib/components/svg/descSort.svelte";
	import AscSort from "$lib/components/svg/ascSort.svelte";
	import PaperSend from "$lib/components/svg/paperSend.svelte";
	import { PageTitle, toastData } from "$lib/stores";
	import { slide } from "svelte/transition";
	import ChevronLeft from "$lib/components/svg/chevronLeft.svelte";
	import ChevronRight from "$lib/components/svg/chevronRight.svelte";
	import ProfileCard from "$lib/components/card/profileCard.svelte";
	import type { ActionData, PageData } from "./$types";
	import { applyAction, enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import AskCardTitle from "$lib/components/card/askCardTitle.svelte";
	import AskInputAnon from "$lib/components/input/askInputAnon.svelte";
	import AskInputQuestions from "$lib/components/input/askInputQuestions.svelte";
	import SkeletonQuestions from "$lib/components/question/skeletonQuestions.svelte";
	import ErrorRetry from "$lib/components/error/errorRetry.svelte";
	import { page } from "$app/stores";

	export let data: PageData;
	export let form: ActionData;

	let questionContainer: HTMLDivElement;
	let questions: Promise<Response> | undefined;

	let waitingResult = false;
	let isPublic = true;
	let isAnon = false;
	let questionText = "";
	let sortState = { sort: "desc", show: false };
	let itemsPerPage = { limit: 5, show: false };
	let currentPageNumber = 1;

	$: questionCounter = questionText.length;
	$PageTitle = "MariTanya";
	$: toast = {
		message: form?.message,
		type: form?.type,
	};

	$: $toastData = toast;

	onMount(() => {
		questions = fetchQuestions(
			data.profile?.id as string,
			currentPageNumber,
			sortState.sort,
		);
	});

	async function fetchQuestions(
		receiverId: string,
		page: number,
		sortBy: string,
	) {
		const fd = new FormData();
		fd.set("receiverId", receiverId);
		const q = fetch(`/api/v1/questions?page=${page}&sort=${sortBy}`, {
			method: "POST",
			body: fd,
		});

		await sleep(250);
		return q;
	}
	function sleep(delay: number): Promise<unknown> {
		return new Promise((resolve) => {
			setTimeout(resolve, delay);
		});
	}
</script>

<svelte:head>
	<meta property="og:title" content={`Tanya ke ${data.profile?.name}`} />
	<meta
		property="og:description"
		content={`Mari tanyakan semua hal kepada ${data.profile?.name}`}
	/>
	<meta
		property="og:url"
		content={`${$page.url.origin}/${data.profile?.username}`}
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`Tanya ke ${data.profile?.name}`} />
	<meta
		property="twitter:description"
		content={`Mari tanyakan semua hal kepada ${data.profile?.name}`}
	/>
</svelte:head>

<section class="p-5">
	<ProfileCard
		nama={data.profile?.name ?? ""}
		username={data.profile?.username ?? ""}
		descriptions={data.profile?.bio ?? ""}
	/>
	<br />
	{#if data.profile?.username != data.userData?.username}
		<AskCardTitle
			name={data?.profile?.name}
			bind:isPublic
			{waitingResult}
		/>
		<form
			transition:slide
			use:enhance={() => {
				waitingResult = true;
				return async ({ result }) => {
					if (result.type === "redirect") {
						goto(result.location);
					}
					await applyAction(result);
					questionText = "";
					questions = fetchQuestions(
						// @ts-ignore
						data.profile?.id,
						currentPageNumber,
						sortState.sort,
					);
					waitingResult = false;
				};
			}}
			class="p-2.5 flex flex-col gap-2"
			action={`/${data.profile?.username ?? ""}?/ask`}
			method="post"
		>
			<AskInputAnon bind:isAnon bind:isPublic />
			<AskInputQuestions
				bind:waitingResult
				bind:questionText
				bind:questionCounter
			/>
			<button
				class="btn variant-filled-primary rounded-xl flex gap-2 justify-center items-center"
				type="submit"
				disabled={questionCounter > 500 ? true : false}
			>
				<PaperSend />
				Send
			</button>
		</form>
	{/if}
	<!-- container question -->
	{#if questions}
		{#await questions}
			<SkeletonQuestions props={{ limit: itemsPerPage.limit }} />
		{:then res}
			{#await res.json() then listQuestion}
				<div class="p-2.5">
					<div class="flex flex-row justify-between py-2.5">
						<QuestionPageNumber {currentPageNumber} />
						{#if listQuestion.q && listQuestion.q.length > 0}
							<div class="flex flex-row gap-2 items-center">
								<DropdownMenu
									bind:show={sortState.show}
									optionPositions={"right-0"}
								>
									<button
										slot="menu"
										class="fill-surface-100 dark:hover:bg-surface-800 p-2.5 rounded-xl"
									>
										{#if sortState.sort === "desc"}
											<DescSort />
										{:else}
											<AscSort />
										{/if}
									</button>
									<svelte:fragment slot="options">
										<button
											on:click={() => {
												if (sortState.sort !== "desc") {
													questions = fetchQuestions(
														// @ts-ignore
														data.profile?.id,
														currentPageNumber,
														"desc",
													);
													sortState.sort = "desc";
												}
												sortState.show = false;
											}}
											class="outline-none flex items-center gap-4 fill-surface-100 dark:hover:bg-surface-700 p-2.5"
										>
											<DescSort />
											<span>Descending</span>
										</button>
										<button
											on:click={() => {
												if (sortState.sort !== "asc") {
													questions = fetchQuestions(
														// @ts-ignore
														data.profile?.id,
														currentPageNumber,
														"asc",
													);
													sortState.sort = "asc";
												}
												sortState.show = false;
											}}
											class="flex items-center outline-none gap-4 fill-surface-100 dark:hover:bg-surface-700 p-2.5"
										>
											<AscSort />
											<span>Ascending</span>
										</button>
									</svelte:fragment>
								</DropdownMenu>
							</div>
						{/if}
					</div>
					<div
						bind:this={questionContainer}
						class="flex flex-col gap-4"
					>
						{#each listQuestion.q as q, i (i)}
							<Question
								{q}
								userId={data.userData?.id}
								callback={() => {
									questions = fetchQuestions(
										// @ts-ignore
										data.profile?.id,
										currentPageNumber,
										sortState.sort,
									);
								}}
							/>
						{/each}
					</div>

					{#if listQuestion.q && listQuestion.q.length > 0}
						<div class="py-5 flex flex-row justify-between">
							{#if listQuestion.prev > 0}
								<button
									on:click={() => {
										currentPageNumber = listQuestion.prev;
										questions = fetchQuestions(
											//@ts-ignore
											data.profile?.id,
											listQuestion.prev,
											sortState.sort,
										);
									}}
									class="fill-surface-100 hover:bg-surface-800 p-2.5 rounded-xl"
								>
									<ChevronLeft />
								</button>
							{:else}
								<br />
							{/if}

							{#if listQuestion.next}
								<button
									on:click={() => {
										currentPageNumber = listQuestion.next;
										questions = fetchQuestions(
											//@ts-ignore
											data.profile?.id,
											listQuestion.next,
											sortState.sort,
										);
									}}
									class="fill-surface-100 hover:bg-surface-800 p-2.5 rounded-xl"
								>
									<ChevronRight />
								</button>
							{:else}
								<br />
							{/if}
						</div>
					{/if}
				</div>
			{:catch err}
				{err}
				<ErrorRetry
					props={{
						isRetryAble: true,
						callback: () => {
							questions = fetchQuestions(
								//@ts-ignore
								data.profile?.id,
								currentPageNumber,
								sortState.sort,
							);
						},
					}}
				/>
			{/await}
		{:catch errr}
			{errr}
			<ErrorRetry
				props={{
					isRetryAble: true,
					callback: () => {
						questions = fetchQuestions(
							//@ts-ignore
							data.profile?.id,
							currentPageNumber,
							sortState.sort,
						);
					},
				}}
			/>
		{/await}
	{/if}
</section>
