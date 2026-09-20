<script lang="ts">
	import StatusIcon from './StatusIcon.svelte';
	import { todayIso } from '$lib/utils/date';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	let {
		lesson,
		onToggle
	}: {
		lesson: {
			id: number;
			title: string;
			subject_name: string;
			due_date: string | null;
			status: 'not_started' | 'in_progress' | 'done';
			resource_url: string | null;
			score_value: string | null;
		};
		onToggle: (id: number) => void;
	} = $props();

	const displayStatus = $derived(
		lesson.status !== 'done' && lesson.due_date !== null && lesson.due_date < todayIso()
			? 'overdue'
			: lesson.status
	);
</script>

<li class="lesson-row">
	<button
		type="button"
		onclick={() => onToggle(lesson.id)}
		class="btn-icon-sm"
		aria-label="Toggle status for {lesson.title}"
	>
		<StatusIcon status={displayStatus} />
	</button>
	<div class="grow">
		<div class="lesson-meta">
			<span class="lesson-chip">
				{lesson.subject_name}
			</span>
			{#if lesson.score_value}
				<span class="lesson-chip-score">
					{lesson.score_value}
				</span>
			{/if}
		</div>
		<p class="lesson-title">{lesson.title}</p>
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
