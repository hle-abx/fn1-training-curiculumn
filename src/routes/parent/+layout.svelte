<script lang="ts">
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import Sprout from '@lucide/svelte/icons/sprout';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import FileText from '@lucide/svelte/icons/file-text';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="parent-shell">
	<header class="parent-header">
		<div class="parent-header-inner">
			<p class="brand-mark">
				<Sprout size={20} class="brand-icon" /> trellis
			</p>
			<div class="parent-meta">
				<span>{data.parent.avatar_emoji} {data.parent.name}</span>
				<a href="/" class="parent-switch">switch profile</a>
			</div>
		</div>
	</header>
	<div class="parent-body">
		<nav class="parent-nav">
			<a href="/parent" class="parent-nav-link">
				<LayoutDashboard size={16} /> Dashboard
			</a>
			<a href="/parent/subjects" class="parent-nav-link">
				<BookOpen size={16} /> Subjects & Curriculum
			</a>
			<a href="/parent/calendar" class="parent-nav-link">
				<CalendarDays size={16} /> Calendar
			</a>
			<a href="/parent/reports" class="parent-nav-link">
				<FileText size={16} /> Reports
			</a>
		</nav>
		<div class="parent-content">
			{@render children()}
		</div>
	</div>
</div>
