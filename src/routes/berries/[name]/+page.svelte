<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { getBerry } from '$lib/api/pokeapi';
	import type { Berry } from '$lib/api/schemas';
	import { ArrowLeft } from '@lucide/svelte';

	const name = $derived(page.params.name ?? '');

	let berry = $state<Berry | null>(null);
	let loading = $state(true);
	let errorMsg = $state('');

	async function load(currentName: string) {
		loading = true;
		errorMsg = '';
		try {
			berry = await getBerry(currentName);
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Failed to load this berry.';
		} finally {
			loading = false;
		}
	}

	onMount(() => load(name));
	$effect(() => {
		const current = name;
		if (current) {load(current);}
	});

	const displayName = $derived((berry?.name ?? '').replaceAll('-', ' '));
</script>

<svelte:head>
	<title>{displayName ? `${displayName} — Berries` : 'Berries'}</title>
</svelte:head>

<button type="button" class="back-link" onclick={() => goto(`${base}/berries`)}>
	<ArrowLeft size={16} aria-hidden="true" />
	Back to Berries
</button>

{#if loading}
	<div class="skeleton" style="width: 200px; height: 200px; border-radius: 1rem;" aria-busy="true"></div>
{:else if errorMsg}
	<p class="error-msg" role="alert">{errorMsg}</p>
{:else if berry}
	<article class="berry-detail">
		<img
			src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berry/{berry.name}.png"
			alt={displayName}
			width="120"
			height="120"
		/>
		<h1>{displayName}</h1>
		<section class="info-grid">
			<div class="info-card">
				<span class="info-label">Firmness</span>
				<span class="info-value">{berry.firmness.name.replace(/-/g, ' ')}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Growth time</span>
				<span class="info-value">{berry.growth_time}h</span>
			</div>
			<div class="info-card">
				<span class="info-label">Max harvest</span>
				<span class="info-value">{berry.max_harvest}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Size</span>
				<span class="info-value">{berry.size} mm</span>
			</div>
			<div class="info-card">
				<span class="info-label">Smoothness</span>
				<span class="info-value">{berry.smoothness}</span>
			</div>
		</section>
		<h2>Flavors</h2>
		<div class="flavors-list">
			{#each berry.flavors.filter((f) => f.potency > 0) as flavor (flavor.flavor.name)}
				<span class="flavor-chip">{flavor.flavor.name.replace(/-/g, ' ')}: {flavor.potency}</span>
			{/each}
		</div>
	</article>
{/if}

<style>
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		padding: 0.5rem 0;
		margin-bottom: 1rem;
	}
	.back-link:hover {
		color: var(--color-accent);
	}
	.error-msg {
		color: var(--color-accent);
		text-align: center;
		padding: 3rem 0;
	}
	.berry-detail {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}
	h1 {
		text-transform: capitalize;
		font-size: 2rem;
		margin: 0.5rem 0 1rem;
	}
	h2 {
		font-size: 1.15rem;
		margin: 1rem 0 0.5rem;
	}
	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
		width: 100%;
	}
	.info-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem;
		border-radius: 0.85rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}
	.info-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}
	.info-value {
		font-size: 1.15rem;
		font-weight: 700;
		text-transform: capitalize;
	}
	.flavors-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.flavor-chip {
		padding: 0.35rem 0.75rem;
		border-radius: 0.5rem;
		background: var(--color-surface-2);
		font-size: 0.85rem;
		text-transform: capitalize;
	}
</style>
