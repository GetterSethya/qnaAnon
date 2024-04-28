<script lang="ts">
	import ArrowClockWise from "../svg/arrowClockWise.svelte";
	export let props: {
		isRetryAble: boolean;
		callback: () => void;
	} = { isRetryAble: false, callback: () => {} };
</script>

<div
	class="py-2.5 mx-2.5 rounded-xl flex flex-col gap-2 bg-surface-800 justify-center items-center"
>
	<span class="text-surface-400">
		<small> Something went wrong </small>
	</span>
	{#if props.isRetryAble}
		<button
			on:click={() => {
				props.callback();
			}}
			class="btn variant-filled-primary rounded-xl flex items-center justify-center fill-surface-100"
		>
			<span> Try again </span>
			<span class="mt-1">
				<ArrowClockWise />
			</span>
		</button>
	{/if}
</div>
