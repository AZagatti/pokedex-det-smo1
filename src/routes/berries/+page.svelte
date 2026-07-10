<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { listBerries, idFromUrl } from '$lib/api/pokeapi';

	let berries = $state<{ id: number; name: string }[]>([]);
	let loading = $state(true);
	let errorMsg = $state('');

	onMount(async () => {
		try {
			const res = await listBerries(64, 0);
			berries = res.results
				.map((r) => ({ id: idFromUrl(r.url), name: r.name }))
				.toSorted((a, b) => a.id - b.id);
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Failed to load berries.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Berries — Pokédex</title>
	<meta name="description" content="Browse Pokémon berries: firmness, flavors, growth time, and size." />
</svelte:head>

<h1 class="page-title">Berries</h1>

{#if loading}
	<div class="grid" aria-busy="true">
		{#each Array(12) as _, i (i)}
			<div class="skeleton" style="height: 160px; border-radius: 1rem;"></div>
		{/each}
	</div>
{:else if errorMsg}
	<p class="error-msg" role="alert">{errorMsg}</p>
{:else}
	<div class="grid">
		{#each berries as berry (berry.id)}
			<a href="{base}/berries/{berry.name}" class="berry-card">
				<img
					src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berry/{berry.name}.png"
					alt={berry.name}
					width="64"
					height="64"
					loading="lazy"
				/>
				<span>{berry.name.replace(/-/g, ' ')}</span>
			</a>
		{/each}
	</div>
{/if}

<style>
	.page-title {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1rem;
	}
	.error-msg {
		color: var(--color-accent);
		text-align: center;
		padding: 3rem 0;
	}
	.berry-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 0.75rem;
		border-radius: 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		text-decoration: none;
		color: var(--color-text);
		font-weight: 600;
		text-transform: capitalize;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}
	.berry-card:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-card);
	}
</style>
