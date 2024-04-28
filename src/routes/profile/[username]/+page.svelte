<script lang="ts">
	import { goto } from "$app/navigation";
	import ChangePasswordSetting from "$lib/components/form/changePasswordSetting.svelte";
	import ProfileSetting from "$lib/components/form/profileSetting.svelte";
	import ArrowLeft from "$lib/components/svg/arrowLeft.svelte";
	import { PageTitle, toastData } from "$lib/stores";
	import type { ActionData, PageData } from "./$types";

	export let form: ActionData;
	export let data: PageData;

	let settingState = {
		profile: {
			show: true,
		},
		changePassword: {
			show: false,
		},
	};
	$: toast = {
		message: form?.message,
		type: form?.type,
	};

	$: $toastData = toast;

	$PageTitle = "Settings";
</script>

<div class="border-b border-surface-700">
	<div class="p-2.5 px-5">
		<button
			on:click={() => {
				if (history.length <= 2) {
					goto("/");
				} else {
					history.back();
				}
			}}
			class="flex rounded-xl gap-2 items-center p-2.5 fill-surface-100 hover:bg-surface-800"
		>
			<ArrowLeft />
		</button>
	</div>
</div>
<section class="p-5 text-surface-300">
	<div>
		<h4 class="h4">Manage your profile settings and preferences.</h4>
		<br />

		<div class="flex gap-4">
			<button
				on:click={() => {
					settingState.profile.show = true;
					settingState.changePassword.show = false;
				}}
				class="{settingState.profile.show
					? 'bg-surface-800'
					: ''} hover:bg-surface-700 p-2.5 rounded-xl"
			>
				Profile
			</button>
			<button
				on:click={() => {
					settingState.profile.show = false;
					settingState.changePassword.show = true;
				}}
				class="{settingState.changePassword.show
					? 'bg-surface-800'
					: ''} hover:bg-surface-700 p-2.5 rounded-xl"
			>
				Change password</button
			>
		</div>

		{#if settingState.profile.show}
			<ProfileSetting
				name={data.userData.name}
				username={data.userData.username}
				email={data.userData.email}
				bio={data.userData.bio}
				{form}
			/>
		{/if}

		{#if settingState.changePassword.show}
			<ChangePasswordSetting {form} username={data.userData.username} />
		{/if}
	</div>
</section>
