<script lang="ts">
	import { dayOfMonth, formatFriendlyDate, weekdayLabel } from '$lib/utils/date';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Calendar — trellis</title>
</svelte:head>

<div class="cal-nav">
	<a href="?week={data.prevWeek}" class="btn-icon" aria-label="Previous week">
		<ChevronLeft size={18} />
	</a>
	<h1 class="cal-title">
		{formatFriendlyDate(data.start)} – {formatFriendlyDate(data.end)}
	</h1>
	<a href="?week={data.nextWeek}" class="btn-icon" aria-label="Next week">
		<ChevronRight size={18} />
	</a>
</div>

<div class="cal-parent-stack">
	{#each data.kids as kid (kid.id)}
		<div class="card-padded">
			<div class="cal-kid-header">
				<p class="cal-kid-name">
					<span>{kid.avatar_emoji}</span>
					{kid.name}
				</p>
				<a href="/kid/{kid.id}/calendar" class="link-quiet">
					Full calendar <ChevronRight size={12} />
				</a>
			</div>
			<div class="cal-kid-grid">
				{#each data.days as day (day)}
					<div class="cal-cell {day === data.today ? 'cal-cell-today' : ''}">
						<p class="cal-cell-label">
							{weekdayLabel(day)} {dayOfMonth(day)}
						</p>
						<div class="cal-cell-events">
							{#each kid.byDate[day] as lesson (lesson.id)}
								<p class="cal-cell-event" title={lesson.title}>
									{lesson.title}
								</p>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
