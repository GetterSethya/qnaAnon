<script lang="ts">
	import { slide } from "svelte/transition";

	export let show: boolean = false;
	export let optionPositions: string;
</script>

<div class="relative">
	<button
		class="rounded-xl {show == true
			? 'bg-surface-300 dark:bg-surface-700'
			: 'bg-surface-200 dark:bg-surface-800'} dark:hover:bg-surface-700 hover:bg-surface-300 flex justify-center items-center gap-2"
		on:click={() => {
			show = true;
		}}
	>
		<slot name="menu" />
	</button>

	{#if show == true}
		<div
			transition:slide
			class={`absolute bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 flex flex-col w-fit h-fit rounded-xl overflow-x-hidden mt-2.5 z-20 ${optionPositions}`}
		>
			<slot name="options" />
		</div>
	{/if}
</div>

{#if show == true}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="w-full h-full absolute top-0 left-0 z-10"
		on:click={() => {
			show = false;
		}}
	>
		<br />
	</div>
{/if}
