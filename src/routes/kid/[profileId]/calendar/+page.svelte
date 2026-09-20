<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import LessonRow from '$lib/components/LessonRow.svelte';
	import { dayOfMonth, formatFriendlyDate, weekdayLabel } from '$lib/utils/date';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Phone agenda view starts on today if it's in range, otherwise the
	// first day of the shown week — see design/ui-ux.md §5.6.
	function defaultSelectedDate(): string {
		return data.today >= data.start && data.today <= data.end ? data.today : data.start;
	}

	let selectedDate = $state(defaultSelectedDate());
	$effect(() => {
		if (!(selectedDate in data.byDate)) {
			selectedDate = defaultSelectedDate();
		}
	});

	async function toggle(lessonId: number) {
		const body = new FormData();
		body.set('lessonId', String(lessonId));
		await fetch('?/toggle', { method: 'POST', body });
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Calendar — trellis</title>
</svelte:head>

<div class="page-wide">
	<div class="cal-nav">
		<a
			href="?week={data.prevWeek}"
			class="btn-icon"
			aria-label="Previous week"
		>
			<ChevronLeft size={18} />
		</a>
		<h1 class="cal-title">
			{formatFriendlyDate(data.start)} – {formatFriendlyDate(data.end)}
		</h1>
		<a href="?week={data.nextWeek}" class="btn-icon" aria-label="Next week">
			<ChevronRight size={18} />
		</a>
	</div>

	<!-- Tablet/desktop: 7-column week grid — design/ui-ux.md §5.6 -->
	<div class="cal-week-grid">
		{#each data.days as day (day)}
			<div class="cal-day {day === data.today ? 'cal-day-today' : ''}">
				<p class="cal-day-label">{weekdayLabel(day)}</p>
				<p class="cal-day-date">{dayOfMonth(day)}</p>
				<div class="cal-day-events">
					{#each data.byDate[day] as lesson (lesson.id)}
						<button
							type="button"
							onclick={() => toggle(lesson.id)}
							class="cal-event"
							title={lesson.title}
						>
							{lesson.title}
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Phone: day-picker strip + single-day agenda — design/ui-ux.md §5.6 -->
	<div class="cal-phone">
		<div class="cal-strip">
			{#each data.days as day (day)}
				<button
					type="button"
					onclick={() => (selectedDate = day)}
					class="cal-day-picker {selectedDate === day
						? 'cal-day-picker-active'
						: 'cal-day-picker-idle'}"
				>
					<span class="cal-day-picker-weekday">{weekdayLabel(day)}</span>
					<span class="cal-day-picker-day">{dayOfMonth(day)}</span>
				</button>
			{/each}
		</div>
		<p class="cal-agenda-date">{formatFriendlyDate(selectedDate)}</p>
		{#if data.byDate[selectedDate].length === 0}
			<div class="card-dashed">
				Nothing due — enjoy the day! 🎉
			</div>
		{:else}
			<ul class="list-surface">
				{#each data.byDate[selectedDate] as lesson (lesson.id)}
					<LessonRow {lesson} onToggle={toggle} />
				{/each}
			</ul>
		{/if}
	</div>
</div>
