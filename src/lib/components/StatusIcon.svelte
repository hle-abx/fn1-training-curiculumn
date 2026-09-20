<script lang="ts">
	// Status is always icon + label, never color alone — see design/ui-ux.md §1.3.
	import Circle from '@lucide/svelte/icons/circle';
	import CircleDot from '@lucide/svelte/icons/circle-dot';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	type Status = 'not_started' | 'in_progress' | 'done' | 'overdue';

	let { status }: { status: Status } = $props();

	const CONFIG: Record<Status, { icon: typeof Circle; label: string; classes: string }> = {
		not_started: { icon: Circle, label: 'Not started', classes: 'status-not-started' },
		in_progress: { icon: CircleDot, label: 'In progress', classes: 'status-in-progress' },
		done: { icon: CircleCheck, label: 'Done', classes: 'status-done' },
		overdue: { icon: CircleAlert, label: 'Overdue', classes: 'status-overdue' }
	};

	const config = $derived(CONFIG[status]);
</script>

<span class="status-icon {config.classes}">
	<config.icon size={16} aria-hidden="true" />
	<span class="status-label">{config.label}</span>
</span>
