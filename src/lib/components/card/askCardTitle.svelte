<script lang="ts">
	export let name: string | undefined;
	export let waitingResult: boolean;
	export let isPublic: boolean;
</script>

<div class="mb-2.5 px-2.5 flex flex-row items-center justify-between">
	<div>
		<p class="text-surface-300 font-bold">
			Ask {name ?? ""}
		</p>
	</div>
	<div
		class="btn rounded-xl {isPublic
			? 'bg-surface-700'
			: 'bg-primary-500'} p-1 px-2.5 font-bold"
	>
		<button
			disabled={waitingResult}
			type="button"
			on:click={() => {
				isPublic = !isPublic;
			}}
		>
			{isPublic ? "Public" : "Private"}
		</button>
	</div>
</div>
