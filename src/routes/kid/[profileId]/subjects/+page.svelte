<script lang="ts">
	import type { PageData } from './$types';

	// No +page.server.ts needed here — this page only needs the `subjects`
	// list already loaded by the parent +layout.server.ts. On tablet/desktop
	// the sidebar covers this same list, so this route mainly exists as the
	// phone-friendly "Subjects" destination (see design/ui-ux.md §4.1).
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.profile.name}'s subjects — trellis</title>
</svelte:head>

<div class="page">
	<h1 class="page-title-spaced">Subjects</h1>
	{#if data.subjects.length === 0}
		<div class="card-dashed">
			No subjects assigned yet — check back soon!
		</div>
	{:else}
		<ul class="subject-list">
			{#each data.subjects as subject (subject.id)}
				<li>
					<a
						href="/kid/{data.profile.id}/subjects/{subject.id}"
						class="subject-list-link"
					>
						<span class="row-gap">
							<span
								class="subject-list-dot"
								style="background-color: {subject.color ?? data.profile.color}"
							></span>
							<span class="subject-list-name">{subject.name}</span>
						</span>
						<span class="subject-list-count">{subject.done}/{subject.total}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
