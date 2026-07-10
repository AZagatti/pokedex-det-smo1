<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { getPokemon, getPokemonSpecies, getEvolutionChain, idFromUrl } from '$lib/api/pokeapi';
	import { typeColor } from '$lib/types';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import type { Pokemon, PokemonSpecies, EvolutionChainLink } from '$lib/api/schemas';
	import { Heart, ArrowLeft, Play } from '@lucide/svelte';

	const name = $derived(page.params.name ?? '');

	let pokemon = $state<Pokemon | null>(null);
	let species = $state<PokemonSpecies | null>(null);
	let evolutions = $state<{ name: string; id: number }[]>([]);
	let loading = $state(true);
	let errorMsg = $state('');
	let statsAnimated = $state(false);
	let spriteVariant = $state<'front' | 'back' | 'shiny-front' | 'shiny-back'>('front');
	let audioEl: HTMLAudioElement | undefined = $state();

	const STAT_LABELS: Record<string, string> = {
		attack: 'Attack',
		defense: 'Defense',
		hp: 'HP',
		'special-attack': 'Sp. Atk',
		'special-defense': 'Sp. Def',
		speed: 'Speed'
	};

	function flattenChain(link: EvolutionChainLink): { name: string; id: number }[] {
		const rest = link.evolves_to.flatMap(flattenChain);
		return [{ id: idFromUrl(link.species.url), name: link.species.name }, ...rest];
	}

	async function load(currentName: string) {
		loading = true;
		errorMsg = '';
		statsAnimated = false;
		spriteVariant = 'front';
		try {
			const p = await getPokemon(currentName);
			pokemon = p;
			const s = await getPokemonSpecies(p.species.name);
			species = s;
			const chain = await getEvolutionChain(s.evolution_chain.url);
			evolutions = flattenChain(chain.chain);
			requestAnimationFrame(() => {
				setTimeout(() => (statsAnimated = true), 50);
			});
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Failed to load this Pokémon.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		load(name);
	});

	$effect(() => {
		const current = name;
		if (current) {load(current);}
	});

	const displayName = $derived((pokemon?.name ?? '').replaceAll('-', ' '));
	const genusText = $derived(
		species?.genera.find((g) => g.language.name === 'en')?.genus ?? ''
	);
	const flavorText = $derived(
		(species?.flavor_text_entries.find((f) => f.language.name === 'en')?.flavor_text ?? '').replaceAll(
			/[\n\f]/gu,
			' '
		)
	);
	const statTotal = $derived(pokemon?.stats.reduce((sum, s) => sum + s.base_stat, 0) ?? 0);

	const artwork = $derived(
		pokemon?.sprites.other?.['official-artwork']?.front_default ??
			pokemon?.sprites.front_default ??
			null
	);

	const spriteMap = $derived({
		back: pokemon?.sprites.back_default ?? null,
		front: pokemon?.sprites.front_default ?? null,
		'shiny-back': pokemon?.sprites.back_shiny ?? null,
		'shiny-front': pokemon?.sprites.front_shiny ?? null
	});

	const cryUrl = $derived(pokemon?.cries?.latest ?? pokemon?.cries?.legacy ?? null);

	function playCry() {
		audioEl?.play();
	}
</script>

<svelte:head>
	<title>{displayName ? `${displayName} — Pokédex` : 'Pokédex'}</title>
	<meta name="description" content={flavorText || `View stats and details for ${displayName}.`} />
</svelte:head>

<button type="button" class="back-link" onclick={() => goto(`${base}/`)}>
	<ArrowLeft size={16} aria-hidden="true" />
	Back to Pokédex
</button>

{#if loading}
	<div class="detail-skeleton" aria-busy="true" aria-live="polite">
		<div class="skeleton" style="width: 280px; height: 280px; border-radius: 1.5rem;"></div>
		<div class="skeleton" style="width: 200px; height: 2rem; border-radius: 0.5rem; margin-top: 1rem;"></div>
	</div>
{:else if errorMsg}
	<p class="error-msg" role="alert">{errorMsg}</p>
{:else if pokemon}
	<article class="detail entrance">
		<header class="detail-header">
			<div class="artwork-wrap">
				{#if artwork}
					<img src={artwork} alt={displayName} class="artwork" width="280" height="280" />
				{/if}
			</div>
			<div class="header-info">
				<span class="dex-number">#{String(pokemon.id).padStart(3, '0')}</span>
				<h1>{displayName}</h1>
				{#if genusText}<p class="genus">{genusText}</p>{/if}
				<div class="types">
					{#each pokemon.types as t (t.type.name)}
						<span class="type-badge" style="background-color: {typeColor(t.type.name)}">{t.type.name}</span>
					{/each}
				</div>
				<div class="header-actions">
					<button
						type="button"
						class="fav-btn"
						onclick={() => favoritesStore.toggle(pokemon!.name)}
						aria-pressed={favoritesStore.has(pokemon.name)}
						aria-label={favoritesStore.has(pokemon.name) ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
					>
						<Heart size={18} fill={favoritesStore.has(pokemon.name) ? 'currentColor' : 'none'} aria-hidden="true" />
						{favoritesStore.has(pokemon.name) ? 'Favorited' : 'Add to favorites'}
					</button>
					{#if cryUrl}
						<button type="button" class="cry-btn" onclick={playCry} aria-label="Play {displayName} cry">
							<Play size={16} aria-hidden="true" />
							Play cry
						</button>
						<audio bind:this={audioEl} src={cryUrl} preload="none"></audio>
					{/if}
				</div>
			</div>
		</header>

		{#if flavorText}
			<p class="flavor-text">{flavorText}</p>
		{/if}

		<section class="info-grid">
			<div class="info-card">
				<span class="info-label">Height</span>
				<span class="info-value">{(pokemon.height / 10).toFixed(1)} m</span>
			</div>
			<div class="info-card">
				<span class="info-label">Weight</span>
				<span class="info-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
			</div>
			<div class="info-card">
				<span class="info-label">Base experience</span>
				<span class="info-value">{pokemon.base_experience ?? '—'}</span>
			</div>
			<div class="info-card">
				<span class="info-label">Stat total</span>
				<span class="info-value">{statTotal}</span>
			</div>
		</section>

		<section class="section-block">
			<h2>Base stats</h2>
			<div class="stats-list">
				{#each pokemon.stats as stat (stat.stat.name)}
					<div class="stat-row">
						<span class="stat-label">{STAT_LABELS[stat.stat.name] ?? stat.stat.name}</span>
						<div class="stat-bar-track">
							<div
								class="stat-bar-fill"
								style="width: {statsAnimated ? Math.min(100, (stat.base_stat / 255) * 100) : 0}%; background: {typeColor(pokemon.types[0]?.type.name ?? 'normal')}"
							></div>
						</div>
						<span class="stat-value">{stat.base_stat}</span>
					</div>
				{/each}
			</div>
		</section>

		<section class="section-block">
			<h2>Abilities</h2>
			<ul class="abilities-list">
				{#each pokemon.abilities as ability (ability.ability.name)}
					<li>
						{ability.ability.name.replace(/-/g, ' ')}
						{#if ability.is_hidden}<span class="hidden-tag">Hidden</span>{/if}
					</li>
				{/each}
			</ul>
		</section>

		<section class="section-block">
			<h2>Example moves</h2>
			<div class="moves-list">
				{#each pokemon.moves.slice(0, 8) as move (move.move.name)}
					<span class="move-chip">{move.move.name.replace(/-/g, ' ')}</span>
				{/each}
			</div>
		</section>

		{#if evolutions.length > 1}
			<section class="section-block">
				<h2>Evolution chain</h2>
				<div class="evolution-chain">
					{#each evolutions as evo, i (evo.name)}
						{#if i > 0}<span class="evo-arrow" aria-hidden="true">→</span>{/if}
						<a href="{base}/pokemon/{evo.name}" class="evo-item">
							<img
								src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{evo.id}.png"
								alt={evo.name}
								width="72"
								height="72"
								loading="lazy"
							/>
							<span>{evo.name.replace(/-/g, ' ')}</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<section class="section-block">
			<h2>Sprite variants</h2>
			<div class="sprite-variants">
				<div class="variant-tabs" role="tablist" aria-label="Sprite variant">
					{#each Object.keys(spriteMap) as key (key)}
						<button
							type="button"
							role="tab"
							aria-selected={spriteVariant === key}
							class:active={spriteVariant === key}
							onclick={() => (spriteVariant = key as typeof spriteVariant)}
						>
							{key.replace('-', ' ')}
						</button>
					{/each}
				</div>
				<div class="variant-display">
					{#if spriteMap[spriteVariant]}
						<img src={spriteMap[spriteVariant] ?? ''} alt="{displayName} {spriteVariant}" width="120" height="120" />
					{:else}
						<p class="no-sprite">Not available</p>
					{/if}
				</div>
			</div>
		</section>
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

	.detail-skeleton {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 0;
	}

	.error-msg {
		text-align: center;
		padding: 3rem 0;
		color: var(--color-accent);
		font-weight: 600;
	}

	.entrance {
		animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.entrance {
			animation: none;
		}
	}

	.detail-header {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.artwork-wrap {
		flex-shrink: 0;
		width: 280px;
		height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
		border-radius: 1.5rem;
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-card);
	}

	.artwork {
		width: 90%;
		height: 90%;
		object-fit: contain;
	}

	.header-info {
		flex: 1;
		min-width: 240px;
	}

	.dex-number {
		font-weight: 700;
		color: var(--color-text-muted);
	}

	h1 {
		text-transform: capitalize;
		font-size: 2.25rem;
		margin: 0.15rem 0;
	}

	.genus {
		color: var(--color-text-muted);
		margin: 0 0 0.75rem;
	}

	.types {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.fav-btn,
	.cry-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.15s ease;
	}
	.fav-btn:hover,
	.cry-btn:hover {
		background: var(--color-surface-hover);
		transform: translateY(-1px);
	}
	.fav-btn[aria-pressed='true'] {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.flavor-text {
		font-size: 1.05rem;
		line-height: 1.6;
		color: var(--color-text-muted);
		max-width: 60ch;
		margin-bottom: 2rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
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
		letter-spacing: 0.03em;
	}

	.info-value {
		font-size: 1.35rem;
		font-weight: 700;
	}

	.section-block {
		margin-bottom: 2rem;
	}

	.section-block h2 {
		font-size: 1.15rem;
		margin-bottom: 0.85rem;
	}

	.stats-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.stat-row {
		display: grid;
		grid-template-columns: 90px 1fr 40px;
		align-items: center;
		gap: 0.75rem;
	}

	.stat-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.stat-bar-track {
		height: 10px;
		border-radius: 999px;
		background: var(--color-surface-2);
		overflow: hidden;
	}

	.stat-value {
		text-align: right;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.abilities-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.abilities-list li {
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		text-transform: capitalize;
		font-weight: 600;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.hidden-tag {
		font-size: 0.65rem;
		background: var(--color-accent);
		color: white;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		text-transform: uppercase;
	}

	.moves-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.move-chip {
		padding: 0.35rem 0.75rem;
		border-radius: 0.5rem;
		background: var(--color-surface-2);
		font-size: 0.85rem;
		text-transform: capitalize;
	}

	.evolution-chain {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}

	.evo-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		text-decoration: none;
		color: var(--color-text);
		padding: 0.75rem;
		border-radius: 0.85rem;
		transition: background-color 0.15s ease;
	}
	.evo-item:hover {
		background: var(--color-surface-hover);
	}
	.evo-item span {
		text-transform: capitalize;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.evo-arrow {
		font-size: 1.25rem;
		color: var(--color-text-muted);
	}

	.sprite-variants {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.variant-tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.variant-tabs button {
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-muted);
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
		text-transform: capitalize;
	}

	.variant-tabs button.active {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
	}

	.variant-display {
		width: 140px;
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 1rem;
	}

	.variant-display img {
		image-rendering: pixelated;
	}

	.no-sprite {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}
</style>
