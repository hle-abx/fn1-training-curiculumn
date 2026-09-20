<script lang="ts">
	let {
		name,
		avatarEmoji,
		color,
		subtitle = '',
		size = 'lg',
		onclick
	}: {
		name: string;
		avatarEmoji: string;
		color: string;
		subtitle?: string;
		size?: 'lg' | 'sm';
		onclick?: () => void;
	} = $props();
</script>

<button
	type="button"
	{onclick}
	class="profile-card {size === 'lg' ? 'profile-card-lg' : 'profile-card-sm'}"
	style="--profile-color: {color}"
>
	<span
		class="profile-avatar {size === 'lg' ? 'profile-avatar-lg' : 'profile-avatar-sm'}"
		style="border-color: var(--profile-color); background-color: color-mix(in srgb, var(--profile-color) 15%, white);"
	>
		{avatarEmoji}
	</span>
	<span class="profile-name {size === 'lg' ? 'profile-name-lg' : 'profile-name-sm'}">{name}</span>
	{#if subtitle}
		<span class="profile-subtitle">{subtitle}</span>
	{/if}
</button>
