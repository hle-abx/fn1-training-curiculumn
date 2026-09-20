<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import LessonRow from '$lib/components/LessonRow.svelte';
	import type { PageData } from './$types';

	// `data` here is merged with the +layout.server.ts load above it, so
	// `data.profile` / `data.subjects` are available alongside this page's
	// own `todayLessons` / `restOfWeek` / `progress`.
	let { data }: { data: PageData } = $props();

	async function toggle(lessonId: number) {
		const body = new FormData();
		body.set('lessonId', String(lessonId));
		await fetch('?/toggle', { method: 'POST', body });
		await invalidateAll();
	}

	const pct = $derived(
		data.progress.total === 0 ? 0 : Math.round((data.progress.done / data.progress.total) * 100)
	);
</script>

<svelte:head>
	<title>{data.profile.name} — Today — trellis</title>
</svelte:head>

<div class="page">
	<div class="progress-row">
		<div class="progress-track">
			<div
				class="progress-fill"
				style="width: {pct}%; background-color: {data.profile.color}"
			></div>
		</div>
		<span class="progress-label">
			{data.progress.done} of {data.progress.total} done this week
		</span>
	</div>

	<section>
		<h2 class="section-label">Today</h2>
		{#if data.todayLessons.length === 0}
			<div class="card-dashed">
				Nothing due today — enjoy the day! 🎉
			</div>
		{:else}
			<ul class="list-surface">
				{#each data.todayLessons as lesson (lesson.id)}
					<LessonRow {lesson} onToggle={toggle} />
				{/each}
			</ul>
		{/if}
	</section>

	{#if data.restOfWeek.length > 0}
		<section class="section-block">
			<h2 class="section-label">This week</h2>
			<ul class="list-surface">
				{#each data.restOfWeek as lesson (lesson.id)}
					<LessonRow {lesson} onToggle={toggle} />
				{/each}
			</ul>
		</section>
	{/if}
</div>
