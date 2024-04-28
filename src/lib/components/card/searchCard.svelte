<script lang="ts">
	import XCircle from "../svg/xCircle.svelte";

	export let nama: string;
	export let username: string;
	export let descriptions: string;
	export let url: string;
	export let showDelete: boolean = true;
</script>

<a
	href={url}
	class="dark:bg-surface-800 rounded-xl py-2.5 px-5 flex justify-between items-center"
>
	<div>
		<p class="font-bold">
			{nama}
		</p>
		<p class="dark:text-surface-300">
			<small>
				{username}
			</small>
		</p>
		<p class="text-surface-300 pt-2.5 line-clamp-1">
			{descriptions}
		</p>
	</div>

	{#if showDelete}
		<div>
			<button class="btn rounded fill-primary-500 hover:fill-primary-700">
				<XCircle />
			</button>
		</div>
	{/if}
</a>
