<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import BookOpen from '@lucide/svelte/icons/book-open';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const base = $derived(`/kid/${data.profile.id}`);
	const isToday = $derived(page.url.pathname === base);
	const isSubjects = $derived(page.url.pathname.startsWith(`${base}/subjects`));
	const isCalendar = $derived(page.url.pathname.startsWith(`${base}/calendar`));
</script>

<div class="kid-shell">
	<!-- Left panel — tablet/desktop only; see design/ui-ux.md §4.1 -->
	<aside class="kid-sidebar">
		<div class="kid-banner" style="background-color: {data.profile.color}">
			<a href="/" class="kid-banner-link">
				<ArrowLeft size={12} /> switch profile
			</a>
			<div class="kid-banner-identity">
				<span class="kid-banner-emoji">{data.profile.avatar_emoji}</span>
				<p class="kid-banner-name">{data.profile.name}</p>
			</div>
		</div>
		<nav class="kid-sidebar-nav">
			<a href={base} class="kid-nav-link">
				<ClipboardList size={16} /> Today
			</a>
			<a href="{base}/calendar" class="kid-nav-link">
				<CalendarDays size={16} /> Calendar
			</a>
			<p class="kid-nav-section">Subjects</p>
			{#if data.subjects.length === 0}
				<p class="kid-nav-empty">No subjects assigned yet.</p>
			{/if}
			{#each data.subjects as subject (subject.id)}
				<a href="{base}/subjects/{subject.id}" class="kid-nav-link-row">
					<span class="row-center grow">
						<span
							class="kid-nav-dot"
							style="background-color: {subject.color ?? data.profile.color}"
						></span>
						<span class="text-ellipsis">{subject.name}</span>
					</span>
					<span class="kid-nav-count">{subject.done}/{subject.total}</span>
				</a>
			{/each}
		</nav>
	</aside>

	<div class="kid-main">
		<!-- Phone header — the left panel collapses into this + a bottom tab bar; see §4.1 -->
		<div class="kid-phone-header" style="background-color: {data.profile.color}">
			<a href="/" class="kid-phone-link">
				<ArrowLeft size={12} /> switch
			</a>
			<p class="kid-phone-name">{data.profile.avatar_emoji} {data.profile.name}</p>
			<span class="kid-phone-spacer"></span>
		</div>
		<div class="kid-content">
			{@render children()}
		</div>
	</div>

	<!-- Phone bottom tab bar — collapsed form of the left panel, design/ui-ux.md §5.3 -->
	<nav class="kid-tab-bar" aria-label="Kid navigation">
		<a
			href={base}
			class="kid-tab {isToday ? 'kid-tab-active' : 'kid-tab-idle'}"
		>
			<ClipboardList size={20} />
			Today
		</a>
		<a
			href="{base}/subjects"
			class="kid-tab {isSubjects ? 'kid-tab-active' : 'kid-tab-idle'}"
		>
			<BookOpen size={20} />
			Subjects
		</a>
		<a
			href="{base}/calendar"
			class="kid-tab {isCalendar ? 'kid-tab-active' : 'kid-tab-idle'}"
		>
			<CalendarDays size={20} />
			Calendar
		</a>
	</nav>
</div>
