<script lang="ts">
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type UnitLite = { id: number; title: string; description: string | null };
	type LessonLite = {
		id: number;
		title: string;
		description: string | null;
		resource_url: string | null;
		due_date: string | null;
		status: string;
		score_value: string | null;
		score_type: string | null;
		notes: string | null;
	};

	type ModalState =
		| { type: 'addUnit' }
		| { type: 'editUnit'; unit: UnitLite }
		| { type: 'addLesson'; unitId: number }
		| { type: 'editLesson'; lesson: LessonLite }
		| null;

	let modal = $state<ModalState>(null);

	const modalTitle = $derived(
		modal?.type === 'addUnit'
			? 'Add unit'
			: modal?.type === 'editUnit'
				? 'Edit unit'
				: modal?.type === 'addLesson'
					? 'Add lesson'
					: modal?.type === 'editLesson'
						? 'Edit lesson'
						: ''
	);

	function confirmSubmit(message: string) {
		return (e: SubmitEvent) => {
			if (!confirm(message)) e.preventDefault();
		};
	}

	function closeOnSuccess() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			modal = null;
		};
	}
</script>

<svelte:head>
	<title>{data.assignment.display_name ?? data.assignment.subject_name} — {data.assignment.kid_name} — trellis</title>
</svelte:head>

<div class="stack">
	<div class="card-header">
		<div>
			<p class="assignment-eyebrow">
				{data.assignment.kid_avatar_emoji} {data.assignment.kid_name} · Grade {data.assignment.grade_level}
			</p>
			<h1 class="page-title-lg">
				{data.assignment.display_name ?? data.assignment.subject_name}
			</h1>
			<p class="text-muted">{data.assignment.lessons_done}/{data.assignment.lesson_count} lessons done</p>
		</div>
		<div class="row-gap">
			<button
				type="button"
				onclick={() => (modal = { type: 'addUnit' })}
				class="btn-chip"
			>
				<Plus size={12} /> Add unit
			</button>
			<form
				method="POST"
				action="?/deleteAssignment"
				use:enhance
				onsubmit={confirmSubmit('Remove this assignment and all of its content? This cannot be undone.')}
			>
				<button type="submit" class="link-danger">
					<Trash2 size={14} /> Unassign
				</button>
			</form>
		</div>
	</div>

	{#if data.units.length === 0}
		<div class="card-dashed-lg">
			No units yet — add the first one to start building this curriculum.
		</div>
	{/if}

	{#each data.units as unit (unit.id)}
		<div class="card-padded-lg">
			<div class="row-between-gap">
				<h2 class="unit-title">{unit.title}</h2>
				<div class="assignment-actions">
					<button
						type="button"
						onclick={() => (modal = { type: 'editUnit', unit })}
						class="link-edit"
					>
						<Pencil size={12} /> Edit
					</button>
					<form
						method="POST"
						action="?/deleteUnit"
						use:enhance
						onsubmit={confirmSubmit('Delete this unit and all its lessons?')}
					>
						<input type="hidden" name="unitId" value={unit.id} />
						<button type="submit" class="link-danger">
							<Trash2 size={12} /> Delete
						</button>
					</form>
					<button
						type="button"
						onclick={() => (modal = { type: 'addLesson', unitId: unit.id })}
						class="btn-chip-sm"
					>
						<Plus size={12} /> Lesson
					</button>
				</div>
			</div>
			{#if unit.description}<p class="unit-description">{unit.description}</p>{/if}

			{#if unit.lessons.length > 0}
				<ul class="list-divide">
					{#each unit.lessons as lesson (lesson.id)}
						<li class="lesson-admin-row">
							<StatusIcon status={lesson.status} />
							<div class="grow">
								<p class="lesson-title">{lesson.title}</p>
								<p class="lesson-meta-line">
									{lesson.due_date ?? 'no due date'}{lesson.score_value ? ` · ${lesson.score_value}` : ''}
								</p>
							</div>
							<button
								type="button"
								onclick={() => (modal = { type: 'editLesson', lesson })}
								class="link-edit-sm"
							>
								<Pencil size={12} /> Edit
							</button>
							<form method="POST" action="?/deleteLesson" use:enhance onsubmit={confirmSubmit('Delete this lesson?')}>
								<input type="hidden" name="lessonId" value={lesson.id} />
								<button type="submit" class="link-danger-sm">
									<Trash2 size={12} /> Delete
								</button>
							</form>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="assignment-empty">No lessons yet.</p>
			{/if}
		</div>
	{/each}
</div>

<Modal open={modal !== null} title={modalTitle} onclose={() => (modal = null)}>
	{#if modal?.type === 'addUnit'}
		<form method="POST" action="?/createUnit" use:enhance={closeOnSuccess} class="stack-form">
			<label class="field">
				<span class="field-label">Title</span>
				<input name="title" required class="input" />
			</label>
			<label class="field">
				<span class="field-label">Description</span>
				<textarea name="description" class="input"></textarea>
			</label>
			<button type="submit" class="btn-primary">
				Add unit
			</button>
		</form>
	{:else if modal?.type === 'editUnit'}
		<form method="POST" action="?/updateUnit" use:enhance={closeOnSuccess} class="stack-form">
			<input type="hidden" name="unitId" value={modal.unit.id} />
			<label class="field">
				<span class="field-label">Title</span>
				<input
					name="title"
					value={modal.unit.title}
					required
					class="input"
				/>
			</label>
			<label class="field">
				<span class="field-label">Description</span>
				<textarea name="description" class="input"
					>{modal.unit.description ?? ''}</textarea
				>
			</label>
			<button type="submit" class="btn-primary">
				Save
			</button>
		</form>
	{:else if modal?.type === 'addLesson'}
		<form method="POST" action="?/createLesson" use:enhance={closeOnSuccess} class="stack-form-tight">
			<input type="hidden" name="unitId" value={modal.unitId} />
			<label class="field">
				<span class="field-label">Title</span>
				<input name="title" required class="input" />
			</label>
			<label class="field">
				<span class="field-label">Description</span>
				<textarea name="description" class="input"></textarea>
			</label>
			<label class="field">
				<span class="field-label">Resource URL</span>
				<input name="resourceUrl" type="url" class="input" />
			</label>
			<label class="field">
				<span class="field-label">Due date</span>
				<input name="dueDate" type="date" class="input" />
			</label>
			<button type="submit" class="btn-primary">
				Add lesson
			</button>
		</form>
	{:else if modal?.type === 'editLesson'}
		<form method="POST" action="?/updateLesson" use:enhance={closeOnSuccess} class="stack-form-tight">
			<input type="hidden" name="lessonId" value={modal.lesson.id} />
			<label class="field">
				<span class="field-label">Title</span>
				<input
					name="title"
					value={modal.lesson.title}
					required
					class="input"
				/>
			</label>
			<label class="field">
				<span class="field-label">Description</span>
				<textarea name="description" class="input"
					>{modal.lesson.description ?? ''}</textarea
				>
			</label>
			<label class="field">
				<span class="field-label">Resource URL</span>
				<input
					name="resourceUrl"
					type="url"
					value={modal.lesson.resource_url ?? ''}
					class="input"
				/>
			</label>
			<div class="form-grid-2">
				<label class="field">
					<span class="field-label">Due date</span>
					<input
						name="dueDate"
						type="date"
						value={modal.lesson.due_date ?? ''}
						class="input"
					/>
				</label>
				<label class="field">
					<span class="field-label">Status</span>
					<select name="status" value={modal.lesson.status} class="input">
						<option value="not_started">Not started</option>
						<option value="in_progress">In progress</option>
						<option value="done">Done</option>
					</select>
				</label>
			</div>
			<div class="form-grid-2">
				<label class="field">
					<span class="field-label">Score</span>
					<input
						name="scoreValue"
						value={modal.lesson.score_value ?? ''}
						placeholder="92% / Pass / A-"
						class="input"
					/>
				</label>
				<label class="field">
					<span class="field-label">Score type</span>
					<select name="scoreType" value={modal.lesson.score_type ?? ''} class="input">
						<option value="">—</option>
						<option value="percent">Percent</option>
						<option value="letter">Letter</option>
						<option value="pass_fail">Pass/Fail</option>
					</select>
				</label>
			</div>
			<label class="field">
				<span class="field-label">Notes</span>
				<textarea name="notes" class="input">{modal.lesson.notes ?? ''}</textarea>
			</label>
			<button type="submit" class="btn-primary">
				Save
			</button>
		</form>
	{/if}
	{#if form?.error}<p class="form-error">{form.error}</p>{/if}
</Modal>
