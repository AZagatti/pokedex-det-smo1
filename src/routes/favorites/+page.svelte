<script lang="ts">
	import { onMount } from 'svelte';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import { getPokemon, idFromUrl } from '$lib/api/pokeapi';
	import { favoritesStore } from '$lib/stores/favorites.svelte';

	interface Item { id: number; name: string; sprite: string | null; types: string[] }

	let items = $state<Item[]>([]);
	let loading = $state(true);

	async function loadFavorites() {
		loading = true;
		const names = favoritesStore.value;
		const fetched = await Promise.all(
			names.map(async (n) => {
				const p = await getPokemon(n);
				const sprite =
					p.sprites.other?.['official-artwork']?.front_default ?? p.sprites.front_default ?? null;
				return { id: p.id, name: p.name, sprite, types: p.types.map((t) => t.type.name) } satisfies Item;
			})
		);
		items = fetched.toSorted((a, b) => a.id - b.id);
		loading = false;
	}

	onMount(loadFavorites);

	$effect(() => {
		void favoritesStore.value;
		if (!loading) {loadFavorites();}
	});
</script>

<svelte:head>
	<title>Favorites — Pokédex</title>
	<meta name="description" content="Your favorited Pokémon, saved locally." />
</svelte:head>

<h1 class="page-title">Favorites</h1>

{#if loading}
	<div class="grid" aria-busy="true">
		{#each Array(6) as _, i (i)}
			<div class="skeleton" style="height: 260px; border-radius: 1rem;"></div>
		{/each}
	</div>
{:else if items.length === 0}
	<p class="empty-state">
		You haven't favorited any Pokémon yet. Tap the heart icon on a Pokémon to add it here.
	</p>
{:else}
	<div class="grid">
		{#each items as item (item.id)}
			<PokemonCard id={item.id} name={item.name} sprite={item.sprite} types={item.types} />
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
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 1rem;
	}
	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
		color: var(--color-text-muted);
		font-size: 1.05rem;
	}
</style>
