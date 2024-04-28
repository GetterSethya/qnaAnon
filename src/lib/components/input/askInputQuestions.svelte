<script lang="ts">
	import { fade } from "svelte/transition";

	export let questionCounter: number;
	export let questionText: string;
	export let waitingResult: boolean;
</script>

<div>
	<div class="flex justify-between">
		<p class="py-2.5 text-surface-300">
			<small>{questionCounter}/500</small>
		</p>
		{#if questionCounter > 500}
			<p
				transition:fade={{ duration: 100 }}
				class="text-primary-500 py-2.5"
			>
				<small> Input exceeds character limit </small>
			</p>
		{/if}
	</div>
	<textarea
		required
		class={`bg-transparent w-full border ${
			questionCounter <= 500 ? "border-surface-700" : "border-red-500"
		} outline-none p-5 rounded-xl`}
		name="inputQuestion"
		id="inputQuestion"
		cols="30"
		rows="5"
		maxlength="500"
		bind:value={questionText}
		disabled={waitingResult}
	/>
</div>
