<script lang="ts">
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import Printer from '@lucide/svelte/icons/printer';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.kid.name} — Report — trellis</title>
</svelte:head>

<div class="screen-only">
	<a href="/parent/reports" class="link-muted">← All reports</a>
</div>

<div class="report-doc">
	<div class="report-header">
		<div>
			<h1 class="page-heading">
				{data.kid.avatar_emoji} {data.kid.name} — Grade {data.grade ?? '—'}
			</h1>
			<p class="text-muted">
				School year: {data.schoolYear?.label ?? '—'} · Printed {data.printedAt}
			</p>
		</div>
		<button
			type="button"
			onclick={() => window.print()}
			class="btn-print"
		>
			<Printer size={14} /> Print
		</button>
	</div>

	{#if data.assignments.length === 0}
		<p class="report-empty">No subjects assigned yet.</p>
	{/if}

	{#each data.assignments as assignment (assignment.id)}
		<section class="report-section">
			<div class="row-baseline">
				<h2 class="page-title-lg">
					{assignment.display_name ?? assignment.subject_name}
				</h2>
				<p class="text-muted">{assignment.lessons_done}/{assignment.lesson_count} done</p>
			</div>

			{#each assignment.units as unit (unit.id)}
				<div class="report-unit">
					<div class="row-baseline">
						<h3 class="unit-title-sm">{unit.title}</h3>
						<p class="text-subtle">
							{unit.lessons.filter((l) => l.status === 'done').length}/{unit.lessons.length}
						</p>
					</div>
					{#if unit.lessons.length > 0}
						<ul class="list-divide-tight">
							{#each unit.lessons as lesson (lesson.id)}
								<li class="report-lesson-row">
									<span class="row-center grow">
										<StatusIcon status={lesson.status} />
										<span class="report-lesson-title">{lesson.title}</span>
									</span>
									<span class="report-lesson-score">{lesson.score_value ?? ''}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</section>
	{/each}

	<div class="report-signatures">
		<p>Parent signature: _______________________</p>
		<p>Date: _______________</p>
	</div>
</div>
