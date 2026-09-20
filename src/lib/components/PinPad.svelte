<script lang="ts">
	import Delete from '@lucide/svelte/icons/delete';

	let {
		color,
		length = 4,
		status = 'idle',
		onsubmit
	}: {
		color: string;
		length?: number;
		status?: 'idle' | 'error';
		onsubmit: (pin: string) => void;
	} = $props();

	let digits = $state<string[]>([]);

	// Wrong PIN: clear the buffer so the dots reset and the shake plays.
	$effect(() => {
		if (status === 'error') {
			digits = [];
		}
	});

	function press(d: string) {
		if (digits.length >= length) return;
		digits = [...digits, d];
		if (digits.length === length) {
			const pin = digits.join('');
			digits = [];
			onsubmit(pin);
		}
	}

	function backspace() {
		digits = digits.slice(0, -1);
	}

	const rows = [
		['1', '2', '3'],
		['4', '5', '6'],
		['7', '8', '9'],
		['', '0', 'backspace']
	];
</script>

<div class="pin-pad">
	<div class="pin-dots" class:animate-shake={status === 'error'}>
		{#each Array(length) as _, i (i)}
			<span
				class="pin-dot"
				style="border-color: {color}; background-color: {i < digits.length ? color : 'transparent'};"
			></span>
		{/each}
	</div>
	<div class="pin-grid">
		{#each rows as row}
			{#each row as key}
				{#if key === ''}
					<div class="pin-spacer"></div>
				{:else if key === 'backspace'}
					<button
						type="button"
						onclick={backspace}
						aria-label="Backspace"
						class="pin-key"
					>
						<Delete size={22} />
					</button>
				{:else}
					<button
						type="button"
						onclick={() => press(key)}
						class="pin-key-digit"
					>
						{key}
					</button>
				{/if}
			{/each}
		{/each}
	</div>
</div>
