<script lang="ts">
	import { page } from "$app/stores";
	import Clipboard from "$lib/components/svg/clipboard.svelte";
	import Share from "../svg/share.svelte";
	import { popup } from "@skeletonlabs/skeleton";
	import type { PopupSettings } from "@skeletonlabs/skeleton";
	import { clipboard } from "@skeletonlabs/skeleton";

	export let nama: string;
	export let username: string;
	export let descriptions: string;

	const popUpShare: PopupSettings = {
		event: "click",
		target: "popUpShare",
		placement: "left",
	};
	const profileUrl: string = `${$page.url.origin}/${username}`;
</script>

<div class="dark:bg-surface-800 p-5 m-2.5 rounded-xl">
	<p class="font-bold">{nama}</p>
	<p class="dark:text-surface-300">
		<small>{username}</small>
	</p>
	<p class="text-surface-300 pt-2.5">
		{descriptions}
	</p>
	<div>
		<button
			use:popup={popUpShare}
			class="flex ms-auto flex-row gap-2 items-center fill-surface-100 bg-surface-700 p-2.5 mt-2.5 rounded-xl hover:bg-surface-600"
		>
			<Share />
		</button>
	</div>
</div>

<div class="bg-surface-700 p-5 max-sm:p-2.5 rounded-xl" data-popup="popUpShare">
	<div
		class="px-5 max-sm:px-2.5 flex flex-row gap-4 items-center py-2.5 border border-surface-700 rounded-xl z-20"
	>
		<span>
			{profileUrl}
		</span>
		<button use:clipboard={profileUrl} class="fill-surface-100">
			<Clipboard />
		</button>
	</div>
</div>
