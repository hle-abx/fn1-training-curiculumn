<script lang="ts">
	import type { PageData } from './$types';
	import Circle from '@lucide/svelte/icons/circle';
	import CircleDot from '@lucide/svelte/icons/circle-dot';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { data }: { data: PageData } = $props();

	// Literal class strings (not interpolated) so Tailwind's source scanner
	// picks them up — see design/ui-ux.md §1.3, status is never color-only.
	const DOT_CLASSES: Record<string, string> = {
		none: 'status-dot-none',
		not_started: 'status-dot-not-started',
		in_progress: 'status-dot-in-progress',
		done: 'status-dot-done',
		overdue: 'status-dot-overdue'
	};
	const DOT_ICON: Record<string, typeof Circle | null> = {
		none: null,
		not_started: Circle,
		in_progress: CircleDot,
		done: CircleCheck,
		overdue: CircleAlert
	};
</script>

<svelte:head>
	<title>Parent dashboard — trellis</title>
</svelte:head>

<h1 class="page-title">This week, all kids</h1>

<div class="week-table-wrap">
	<table class="week-table">
		<thead>
			<tr class="week-table-head">
				<th class="week-table-th-name"></th>
				{#each data.days as day (day)}
					<th class="week-table-th">{day.slice(5)}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.kids as kid (kid.id)}
				<tr class="week-table-row">
					<td class="week-table-name">
						<span>{kid.avatar_emoji}</span>
						{kid.name}
					</td>
					{#each kid.week as day (day.date)}
						<td class="week-table-cell">
							<span class="status-dot {DOT_CLASSES[day.status]}">
								{#if DOT_ICON[day.status]}
									{@const Icon = DOT_ICON[day.status]}
									<Icon size={14} />
								{/if}
							</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="kid-summary-grid">
	{#each data.kids as kid (kid.id)}
		<div class="card-padded">
			<div class="row-center">
				<span class="kid-summary-emoji">{kid.avatar_emoji}</span>
				<div>
					<p class="unit-title">{kid.name}</p>
					<p class="kid-summary-grade">Grade {kid.grade ?? '—'}</p>
				</div>
			</div>
			<dl class="kid-summary-stats">
				<div class="kid-summary-stat"><dt>Subjects</dt><dd>{kid.subjectCount}</dd></div>
				<div class="kid-summary-stat"><dt>Due today</dt><dd>{kid.dueToday}</dd></div>
				<div class="kid-summary-stat">
					<dt>This week</dt><dd>{kid.progress.done}/{kid.progress.total}</dd>
				</div>
			</dl>
			<a href="/kid/{kid.id}" class="kid-summary-link">
				View <ChevronRight size={14} />
			</a>
		</div>
	{/each}
</div>
