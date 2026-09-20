<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';

	let {
		open,
		title,
		onclose,
		children
	}: {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
	} = $props();

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window {onkeydown} />

{#if open}
	<div
		class="modal-backdrop"
		onclick={onclose}
		onkeydown={(e) => e.key === 'Escape' && onclose()}
		role="presentation"
	>
		<div
			class="modal-panel"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-label={title}
		>
			<div class="modal-header">
				<h2 class="modal-title">{title}</h2>
				<button
					type="button"
					onclick={onclose}
					class="btn-modal-close"
					aria-label="Close"
				>
					<X size={18} />
				</button>
			</div>
			{@render children()}
		</div>
	</div>
{/if}
