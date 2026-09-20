<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import PinPad from '$lib/components/PinPad.svelte';
	import Sprout from '@lucide/svelte/icons/sprout';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const kids = $derived(data.profiles.filter((p) => p.role === 'kid'));
	const parents = $derived(data.profiles.filter((p) => p.role === 'parent'));

	let selected = $state<(typeof data.profiles)[number] | null>(null);
	let pinStatus = $state<'idle' | 'error'>('idle');

	let greeting = $state('Hello');
	$effect(() => {
		const h = new Date().getHours();
		greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
	});

	function select(profile: (typeof data.profiles)[number]) {
		selected = profile;
		pinStatus = 'idle';
	}

	function back() {
		selected = null;
		pinStatus = 'idle';
	}

	async function handlePinSubmit(pin: string) {
		if (!selected) return;
		const body = new FormData();
		body.set('profileId', String(selected.id));
		body.set('pin', pin);

		const response = await fetch('?/unlock', { method: 'POST', body });
		const result = deserialize(await response.text());

		if (result.type === 'failure') {
			pinStatus = 'error';
			return;
		}
		// 'redirect' (success) — let SvelteKit navigate to the destination.
		await applyAction(result);
	}
</script>

<svelte:head>
	<title>trellis</title>
</svelte:head>

<main class="picker-screen">
	<div class="picker-hero">
		<p class="brand-mark-hero">
			<Sprout size={32} class="brand-icon" /> trellis
		</p>
		<p class="greeting">{greeting} — who's learning?</p>
	</div>

	{#if !selected}
		<div class="picker-groups">
			<div class="picker-kids">
				{#each kids as kid (kid.id)}
					<ProfileCard
						name={kid.name}
						avatarEmoji={kid.avatar_emoji}
						color={kid.color}
						subtitle={kid.dueToday === 0 ? 'all caught up' : `${kid.dueToday} due today`}
						size="lg"
						onclick={() => select(kid)}
					/>
				{/each}
			</div>
			<div class="picker-parents">
				{#each parents as parent (parent.id)}
					<ProfileCard
						name={parent.name}
						avatarEmoji={parent.avatar_emoji}
						color={parent.color}
						size="sm"
						onclick={() => select(parent)}
					/>
				{/each}
			</div>
		</div>
	{:else}
		<div class="picker-pin">
			<button type="button" onclick={back} class="link-back">
				<ArrowLeft size={14} /> back
			</button>
			<p class="pin-prompt">
				{selected.avatar_emoji} Hi {selected.name}! Enter your PIN
			</p>
			<PinPad color={selected.color} status={pinStatus} onsubmit={handlePinSubmit} />
		</div>
	{/if}
</main>
