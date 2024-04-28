<script lang="ts">
	export let isAnon: boolean;
	export let isPublic: boolean;
</script>

<div class="flex flex-col gap-2 mb-2.5">
	{#if !isAnon}
		<input
			type="text"
			name="inputName"
			id="inputName"
			placeholder="Name"
			maxlength={50}
			disabled={isAnon ? true : false}
			class="px-5 py-2.5 flex grow bg-transparent rounded-xl border border-surface-700 outline-none"
			required
		/>
	{/if}
	<div class="flex items-center gap-2">
		<input
			class="checkbox bg-transparent"
			type="checkbox"
			name="isAnon"
			on:input={(e) => {
				//@ts-ignore
				isAnon = e.target.checked;
			}}
		/>
		<p class="text-surface-300">Send as Anon</p>
	</div>

	<input type="hidden" name="inputVisibility" bind:value={isPublic} />
</div>
