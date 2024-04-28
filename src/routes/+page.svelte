<script lang="ts">
	import SearchCard from "$lib/components/card/searchCard.svelte";
	import Search from "$lib/components/svg/search.svelte";
	import { PageTitle } from "$lib/stores";
	import { ProgressRadial } from "@skeletonlabs/skeleton";
	import type { PageData } from "./$types";
	import { fade } from "svelte/transition";

	let searchVal: string | undefined;

	export let data: PageData;
	$PageTitle = "Discover";
	let searchResult: Promise<Response> | undefined;
	$: searchResult = undefined;

	async function handleSearch() {
		try {
			if (searchVal === "") {
				searchResult = undefined;
			}
			if (searchVal && searchVal.length >= 2) {
				const fd = new FormData();
				fd.set("inputSearch", searchVal);
				searchResult = fetch("/api/v1/users", {
					method: "POST",
					body: fd,
				});
			}
		} catch {
			console.log("Something went wrong when searching user");
		}
	}

	function debounce(func: Function, timeout: number) {
		let timer: any;
		return (...args: any) => {
			clearTimeout(timer);
			timer = setTimeout(async () => {
				// @ts-ignore
				await func.apply(this, args);
			}, timeout);
		};
	}
</script>

<div class="w-full flex flex-col p-5">
	<div class="flex gap-2 grow rounded-xl p-2.5 border border-surface-700">
		<input
			class="w-full bg-transparent outline-none"
			type="text"
			name="inputSearch"
			id="inputSearch"
			placeholder="Find.."
			bind:value={searchVal}
			on:input={debounce(async () => await handleSearch(), 300)}
		/>
		<div class=" p-2.5 rounded-xl">
			<Search />
		</div>
	</div>
	{#if searchResult}
		{#await searchResult}
			<div
				class="flex flex-col bg-surface-800 p-5 rounded-xl mt-5 items-center justify-center"
			>
				<ProgressRadial width="w-8" meter="stroke-primary-500" />
			</div>
		{:then res}
			{#await res.json() then items}
				<div class="flex flex-col gap-2 mt-5">
					<p transition:fade class="p-2.5 font-bold">Search result</p>
					{#if items && items.length >= 0}
						{#each items as item}
							<SearchCard
								url={`/${item.username}`}
								descriptions={item.bio ?? ""}
								nama={item.name}
								username={item.username}
								showDelete={false}
							/>
						{/each}
					{/if}
				</div>
			{/await}
		{/await}
	{/if}
</div>

<div class="p-5 flex flex-col gap-2">
	<h6 class="h6 font-bold py-2.5">Discover</h6>
	{#await data.usersDiscover}
		<div
			class="flex justify-center rounded-xl bg-surface-800 min-h-24 items-center animate-pulse"
		>
			<ProgressRadial width="w-6" meter="stroke-primary-500" />
		</div>
	{:then users}
		{#if users}
			{#each users as user}
				<SearchCard
					url={`/${user.username}`}
					descriptions={user.bio ?? ""}
					nama={user.name}
					username={user.username}
					showDelete={false}
				/>
			{/each}
		{/if}
	{/await}
</div>

{#if !data.userData?.id}
	<div class="p-5 flex flex-col gap-2">
		<div class="p-5 rounded-xl bg-surface-800 flex flex-col gap-4">
			<h4 class="h4 font-bold">
				Want to know what people think about you?
			</h4>
			<a
				class="btn variant-filled-primary w-fit rounded-xl"
				href="/login"
			>
				Join
			</a>
		</div>
	</div>
{/if}
