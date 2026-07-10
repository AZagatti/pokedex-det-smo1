<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import { listPokemon, getPokemon, idFromUrl } from '$lib/api/pokeapi';
	import { GENERATIONS, TYPE_COLORS, typeColor } from '$lib/types';
	import { Search, X, SlidersHorizontal } from '@lucide/svelte';

	const PAGE_SIZE = 30;
	const TOTAL_POKEMON = 1025;

	interface ListItem { id: number; name: string; sprite: string | null; types: string[] }

	let allNames = $state<{ name: string; id: number }[]>([]);
	let loadedItems = $state<Map<number, ListItem>>(new Map());
	let loadedCount = $state(0);
	let loading = $state(true);
	let loadingMore = $state(false);
	let errorMsg = $state('');

	let query = $state('');
	let debouncedQuery = $state('');
	let selectedGen = $state<number | null>(null);
	let selectedTypes = $state<string[]>([]);
	let sortBy = $state<'dex' | 'stats'>('dex');
	let filtersOpen = $state(false);

	let sentinel: HTMLDivElement | undefined = $state();
	let statTotals = $state<Map<string, number>>(new Map());
	let loadingStats = $state(false);

	function filteredNames() {
		let pool = allNames;
		if (debouncedQuery.trim()) {
			const q = debouncedQuery.trim().toLowerCase();
			pool = pool.filter((p) => p.name.includes(q));
		}
		if (selectedGen) {
			const gen = GENERATIONS.find((g) => g.id === selectedGen);
			if (gen) {pool = pool.filter((p) => p.id >= gen.range[0] && p.id <= gen.range[1]);}
		}
		return pool;
	}

	async function loadNextPage() {
		if (loadingMore) {return;}
		const pool = filteredNames();
		const slice = pool.slice(loadedCount, loadedCount + PAGE_SIZE);
		if (slice.length === 0) {return;}
		loadingMore = true;
		try {
			const fetched = await Promise.all(
				slice.map(async (item) => {
					const cached = loadedItems.get(item.id);
					if (cached) {return cached;}
					const p = await getPokemon(item.id);
					const sprite =
						p.sprites.other?.['official-artwork']?.front_default ?? p.sprites.front_default ?? null;
					const entry: ListItem = {
						id: p.id,
						name: p.name,
						sprite,
						types: p.types.map((t) => t.type.name)
					};
					return entry;
				})
			);
			const next = new Map(loadedItems);
			for (const item of fetched) {next.set(item.id, item);}
			loadedItems = next;
			loadedCount += slice.length;
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Failed to load more Pokémon.';
		} finally {
			loadingMore = false;
		}
	}

	let initialized = $state(false);

	async function loadInitial() {
		loading = true;
		errorMsg = '';
		try {
			const res = await listPokemon(TOTAL_POKEMON, 0);
			allNames = res.results.map((r) => ({ id: idFromUrl(r.url), name: r.name }));
			await loadNextPage();
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Failed to load Pokédex.';
		} finally {
			loading = false;
			initialized = true;
		}
	}


	const visibleItems = $derived.by(() => {
		const pool = filteredNames();
		let items = pool
			.slice(0, loadedCount)
			.map((p) => loadedItems.get(p.id))
			.filter((x): x is ListItem => Boolean(x));
		if (selectedTypes.length > 0) {
			items = items.filter((it) => selectedTypes.every((t) => it.types.includes(t)));
		}
		if (sortBy === 'dex') {
			items = items.toSorted((a, b) => a.id - b.id);
		} else if (sortBy === 'stats') {
			items = items.toSorted((a, b) => (statTotals.get(b.name) ?? 0) - (statTotals.get(a.name) ?? 0));
		}
		return items;
	});

	async function resetAndReload() {
		loadedCount = 0;
		loadedItems = new Map();
		await loadNextPage();
	}

	async function loadStatsForSort() {
		if (sortBy !== 'stats') {return;}
		loadingStats = true;
		try {
			const pool = filteredNames().slice(0, loadedCount);
			const results = await Promise.all(
				pool.map(async (p) => {
					if (statTotals.has(p.name)) {return null;}
					const full = await getPokemon(p.id);
					const total = full.stats.reduce((sum, s) => sum + s.base_stat, 0);
					return { name: p.name, total };
				})
			);
			const next = new Map(statTotals);
			for (const r of results) {
				if (r) {next.set(r.name, r.total);}
			}
			statTotals = next;
		} finally {
			loadingStats = false;
		}
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const q = query;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedQuery = q;
		}, 300);
	});

	$effect(() => {
		void debouncedQuery;
		void selectedGen;
		if (initialized) {resetAndReload();}
	});

	$effect(() => {
		if (sortBy === 'stats') {loadStatsForSort();}
	});

	onMount(() => {
		loadInitial();
		if (!browser) {return;}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && !loadingMore && !loading) {
					loadNextPage();
				}
			},
			{ rootMargin: '400px' }
		);
		if (sentinel) {observer.observe(sentinel);}
		return () => observer.disconnect();
	});

	function toggleType(type: string) {
		selectedTypes = selectedTypes.includes(type)
			? selectedTypes.filter((t) => t !== type)
			: [...selectedTypes, type];
	}

	function clearFilters() {
		query = '';
		debouncedQuery = '';
		selectedGen = null;
		selectedTypes = [];
		sortBy = 'dex';
	}

	const hasActiveFilters = $derived(
		query !== '' || selectedGen !== null || selectedTypes.length > 0 || sortBy !== 'dex'
	);
</script>

<svelte:head>
	<title>Pokédex</title>
	<meta name="description" content="Browse, search, and discover Pokémon with a fast, modern Pokédex." />
</svelte:head>

<div class="toolbar">
	<div class="search-box">
		<Search size={18} aria-hidden="true" />
		<input
			type="search"
			placeholder="Search Pokémon by name…"
			bind:value={query}
			aria-label="Search Pokémon by name"
		/>
	</div>
	<button
		type="button"
		class="filter-toggle"
		onclick={() => (filtersOpen = !filtersOpen)}
		aria-expanded={filtersOpen}
		aria-controls="filters-panel"
	>
		<SlidersHorizontal size={16} aria-hidden="true" />
		Filters
	</button>
	{#if hasActiveFilters}
		<button type="button" class="clear-btn" onclick={clearFilters}>
			<X size={14} aria-hidden="true" /> Clear
		</button>
	{/if}
</div>

{#if filtersOpen}
	<div id="filters-panel" class="filters-panel">
		<div class="filter-group">
			<label for="gen-select">Generation</label>
			<select id="gen-select" bind:value={selectedGen}>
				<option value={null}>All generations</option>
				{#each GENERATIONS as gen (gen.id)}
					<option value={gen.id}>{gen.label}</option>
				{/each}
			</select>
		</div>
		<div class="filter-group">
			<label for="sort-select">Sort by</label>
			<select id="sort-select" bind:value={sortBy}>
				<option value="dex">Dex number</option>
				<option value="stats">Base-stat total {loadingStats ? '(loading…)' : ''}</option>
			</select>
		</div>
		<div class="filter-group types-filter">
			<span id="type-filter-label">Type</span>
			<div class="type-chips" role="group" aria-labelledby="type-filter-label">
				{#each Object.keys(TYPE_COLORS) as type (type)}
					<button
						type="button"
						class="type-chip"
						class:active={selectedTypes.includes(type)}
						style="--chip-color: {typeColor(type)}"
						aria-pressed={selectedTypes.includes(type)}
						onclick={() => toggleType(type)}
					>
						{type}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

{#if errorMsg}
	<p class="error" role="alert">{errorMsg}</p>
{/if}

{#if loading}
	<div class="grid" aria-busy="true" aria-label="Loading Pokémon">
		{#each Array(12) as _, i (i)}
			<div class="skeleton skeleton-card"></div>
		{/each}
	</div>
{:else if visibleItems.length === 0}
	<p class="empty-state">No Pokémon match your filters.</p>
{:else}
	<div class="grid">
		{#each visibleItems as item (item.id)}
			<PokemonCard id={item.id} name={item.name} sprite={item.sprite} types={item.types} />
		{/each}
	</div>
	<div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>
	{#if loadingMore}
		<p class="loading-more">Loading more…</p>
	{/if}
{/if}

<style>
	.toolbar {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 220px;
		padding: 0.6rem 1rem;
		border-radius: 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}

	.search-box input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		color: var(--color-text);
		font-size: 0.95rem;
	}

	.filter-toggle,
	.clear-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 1rem;
		border-radius: 0.75rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.filter-toggle:hover,
	.clear-btn:hover {
		background: var(--color-surface-hover);
	}

	.filters-panel {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.filter-group select {
		padding: 0.45rem 0.65rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		color: var(--color-text);
	}

	.types-filter {
		flex: 1;
		min-width: 260px;
	}

	.type-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.type-chip {
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		border: 1.5px solid var(--chip-color);
		background: transparent;
		color: var(--color-text);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: capitalize;
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.type-chip.active {
		background: var(--chip-color);
		color: white;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
	}

	.skeleton-card {
		height: 190px;
		border-radius: 1rem;
	}

	.sentinel {
		height: 1px;
	}

	.loading-more,
	.empty-state,
	.error {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-muted);
	}

	.error {
		color: var(--color-accent);
	}
</style>
