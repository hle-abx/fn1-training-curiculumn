<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Reports — trellis</title>
</svelte:head>

<h1 class="page-title">Reports</h1>
<p class="reports-intro">
	Pick a kid for a printable, per-school-year summary — subjects, units, lessons, status, and scores.
	{#if data.schoolYear}School year: {data.schoolYear.label}{/if}
</p>

<div class="reports-grid">
	{#each data.kids as kid (kid.id)}
		<a
			href="/parent/reports/{kid.id}"
			class="report-card-link"
		>
			<span class="row-center">
				<span class="report-card-emoji">{kid.avatar_emoji}</span>
				<span>
					<span class="report-card-name">{kid.name}</span>
					<span class="report-card-grade">Grade {kid.grade ?? '—'}</span>
				</span>
			</span>
			<span class="report-card-action">
				<FileText size={14} /> <ChevronRight size={14} />
			</span>
		</a>
	{/each}
</div>
