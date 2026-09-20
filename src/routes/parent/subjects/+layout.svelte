<script lang="ts">
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let showAddSubject = $state(false);
</script>

<div class="subjects-layout">
	<aside class="subjects-tree">
		<div class="subjects-tree-header">
			<h2 class="section-title">Subjects</h2>
			<button
				type="button"
				onclick={() => (showAddSubject = true)}
				class="btn-chip-sm"
			>
				<Plus size={12} /> Add
			</button>
		</div>
		<div class="subjects-tree-list">
			{#each data.tree as subject (subject.id)}
				<div>
					<a
						href="/parent/subjects/subject/{subject.id}"
						class="subjects-tree-subject"
					>
						<span class="text-ellipsis">{subject.name}</span>
						<span class="subjects-tree-category">{subject.category}</span>
					</a>
					{#each subject.assignments as a (a.id)}
						<a
							href="/parent/subjects/assignment/{a.id}"
							class="subjects-tree-assignment"
						>
							<span class="text-ellipsis">{a.kid_avatar_emoji} {a.kid_name}</span>
							<span class="subjects-tree-count">{a.lessons_done}/{a.lesson_count}</span>
						</a>
					{:else}
						<p class="subjects-tree-empty">Not assigned yet</p>
					{/each}
				</div>
			{/each}
		</div>
	</aside>

	<div class="subjects-main">
		{@render children()}
	</div>
</div>

<Modal open={showAddSubject} title="Add subject" onclose={() => (showAddSubject = false)}>
	<form
		method="POST"
		action="/parent/subjects?/createSubject"
		use:enhance={() => async ({ update }) => {
			await update();
			showAddSubject = false;
		}}
		class="stack-form"
	>
		<label class="field">
			<span class="field-label">Name</span>
			<input name="name" required class="input" />
		</label>
		<label class="field">
			<span class="field-label">Category</span>
			<select name="category" class="input">
				<option value="academic">Academic</option>
				<option value="skill">Skill</option>
			</select>
		</label>
		<button type="submit" class="btn-primary">
			Add subject
		</button>
	</form>
</Modal>
