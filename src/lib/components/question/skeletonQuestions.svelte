<script lang="ts">
	import { ProgressRadial } from "@skeletonlabs/skeleton";

	export let props: { limit: number };
</script>

<div class="p-2.5">
	<div class="bg-surface-800 rounded-xl p-5 animate-pulse ease-in-out">
		<br />
	</div>
	{#each Array(props.limit) as _}
		<div
			class="flex flex-col bg-surface-800 p-7 rounded-xl mt-5 items-center justify-center"
		>
			<ProgressRadial width="w-8" meter="stroke-primary-500" />
		</div>
	{/each}
	<div class="bg-surface-800 rounded-xl p-5 animate-pulse ease-in-out mt-5">
		<br />
	</div>
</div>
