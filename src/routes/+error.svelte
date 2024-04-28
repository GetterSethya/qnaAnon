<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import ArrowClockWise from "$lib/components/svg/arrowClockWise.svelte";
</script>

<main class="min-h-screen flex w-full">
	<div class="flex flex-col m-auto items-center justify-center gap-2">
		{#if $page.status == 500}
			<span class="text-surface-400"> Something went wrong </span>
			<button
				on:click={() => {
					location.reload();
				}}
				class="w-fit btn variant-filled-primary rounded-xl fill-surface-100"
			>
				<ArrowClockWise />
			</button>
		{:else if $page.status == 400}
			<span class="text-surface-400"> Not Found </span>
		{:else}
			<span class="text-surface-400"> Something went wrong </span>
			<button
				on:click={() => {
					goto("/");
				}}
				class="w-fit btn variant-filled-primary rounded-xl fill-surface-100"
			>
				<ArrowClockWise />
			</button>
		{/if}
	</div>
</main>
