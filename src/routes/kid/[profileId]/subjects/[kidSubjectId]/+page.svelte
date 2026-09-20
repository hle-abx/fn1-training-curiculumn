<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import { todayIso } from '$lib/utils/date';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function toggle(lessonId: number) {
		const body = new FormData();
		body.set('lessonId', String(lessonId));
		await fetch('?/toggle', { method: 'POST', body });
		await invalidateAll();
	}

	function displayStatus(lesson: {
		status: 'not_started' | 'in_progress' | 'done';
		due_date: string | null;
	}): 'not_started' | 'in_progress' | 'done' | 'overdue' {
		return lesson.status !== 'done' && lesson.due_date !== null && lesson.due_date < todayIso()
			? 'overdue'
			: lesson.status;
	}

	const pct = $derived(
		data.assignment.lesson_count === 0
			? 0
			: Math.round((data.assignment.lessons_done / data.assignment.lesson_count) * 100)
	);
</script>

<svelte:head>
	<title>{data.assignment.display_name ?? data.assignment.subject_name} — trellis</title>
</svelte:head>

<div class="page">
	<div class="subject-progress-card">
		<h1 class="page-title-lg">
			{data.assignment.display_name ?? data.assignment.subject_name}
		</h1>
		<div class="progress-inline">
			<div class="progress-track">
				<div
					class="progress-fill"
					style="width: {pct}%; background-color: {data.assignment.color ?? data.assignment.kid_color}"
				></div>
			</div>
			<span class="progress-label">
				{data.assignment.lessons_done}/{data.assignment.lesson_count} done
			</span>
		</div>
	</div>

	{#each data.units as unit, i (unit.id)}
		<details class="unit-details" open={i === 0}>
			<summary class="unit-summary">
				{unit.title}
				<span class="unit-count">
					{unit.lessons.filter((l) => l.status === 'done').length}/{unit.lessons.length}
				</span>
			</summary>
			{#if unit.lessons.length > 0}
				<ul class="unit-lessons">
					{#each unit.lessons as lesson (lesson.id)}
						<li class="lesson-row">
							<button
								type="button"
								onclick={() => toggle(lesson.id)}
								class="btn-icon-sm"
								aria-label="Toggle status for {lesson.title}"
							>
								<StatusIcon status={displayStatus(lesson)} />
							</button>
							<div class="grow">
								<p class="lesson-title">{lesson.title}</p>
								{#if lesson.score_value}
									<p class="text-score">{lesson.score_value}</p>
								{/if}
							</div>
							{#if lesson.resource_url}
								<a
									href={lesson.resource_url}
									target="_blank"
									rel="noopener noreferrer"
									class="btn-icon-link"
									aria-label="Open resource for {lesson.title}"
								>
									<ExternalLink size={16} />
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</details>
	{/each}
</div>
