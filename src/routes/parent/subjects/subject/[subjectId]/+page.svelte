<script lang="ts">
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAssign = $state(false);

	function confirmSubmit(message: string) {
		return (e: SubmitEvent) => {
			if (!confirm(message)) e.preventDefault();
		};
	}
</script>

<svelte:head>
	<title>{data.subject.name} — Subjects — trellis</title>
</svelte:head>

<div class="stack">
	<div class="card-padded-lg">
		<div class="row-start">
			<div>
				<h1 class="page-title-lg">{data.subject.name}</h1>
				<p class="subject-meta">
					{data.subject.category}{data.subject.is_preset ? ' · preset' : ''}
				</p>
			</div>
			<form method="POST" action="?/delete" use:enhance onsubmit={confirmSubmit('Delete this subject?')}>
				<button type="submit" class="link-danger">
					<Trash2 size={14} /> Delete subject
				</button>
			</form>
		</div>

		<form method="POST" action="?/update" use:enhance class="form-inline">
			<label class="field">
				<span class="field-label-sm">Name</span>
				<input
					name="name"
					value={data.subject.name}
					class="input-sm"
				/>
			</label>
			<label class="field">
				<span class="field-label-sm">Category</span>
				<select name="category" value={data.subject.category} class="input-sm">
					<option value="academic">Academic</option>
					<option value="skill">Skill</option>
				</select>
			</label>
			<button type="submit" class="btn-primary-sm">
				Save
			</button>
		</form>
		{#if form?.error}
			<p class="form-error">{form.error}</p>
		{/if}
	</div>

	<div class="card-padded-lg">
		<div class="row-between">
			<h2 class="section-title">Assigned to</h2>
			<button
				type="button"
				onclick={() => (showAssign = true)}
				class="btn-chip-xs"
			>
				<Plus size={12} /> Assign to a kid
			</button>
		</div>
		{#if data.assignments.length === 0}
			<p class="assignment-empty">Not assigned to any kid yet.</p>
		{:else}
			<ul class="list-divide">
				{#each data.assignments as a (a.id)}
					<li class="assignment-list-item">
						<a href="/parent/subjects/assignment/{a.id}" class="assignment-list-link">
							<span>{a.kid_avatar_emoji}</span>
							{a.kid_name}
							<span class="assignment-grade">Grade {a.grade_level}</span>
						</a>
						<span class="assignment-count">{a.lessons_done}/{a.lesson_count} lessons</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<Modal open={showAssign} title="Assign {data.subject.name} to a kid" onclose={() => (showAssign = false)}>
	<form
		method="POST"
		action="?/assign"
		use:enhance={() => async ({ update }) => {
			await update();
			showAssign = false;
		}}
		class="stack-form"
	>
		<label class="field">
			<span class="field-label">Kid</span>
			<select name="kidProfileId" required class="input">
				{#each data.kids as kid (kid.id)}
					<option value={kid.id}>{kid.avatar_emoji} {kid.name}</option>
				{/each}
			</select>
		</label>
		<label class="field">
			<span class="field-label">Display name (optional)</span>
			<input
				name="displayName"
				placeholder={data.subject.name}
				class="input"
			/>
		</label>
		<button type="submit" class="btn-primary">
			Assign
		</button>
		{#if form?.error}<p class="text-danger">{form.error}</p>{/if}
	</form>
</Modal>
