<script lang="ts">
	import { base } from '$app/paths';
	import { Heart } from '@lucide/svelte';
	import { typeColor } from '$lib/types';
	import { favoritesStore } from '$lib/stores/favorites.svelte';

	const {
		id,
		name,
		sprite,
		types = []
	}: { id: number; name: string; sprite: string | null; types?: string[] } = $props();

	const displayName = $derived(name.replaceAll('-', ' '));
	const dexNumber = $derived(`#${String(id).padStart(3, '0')}`);

	function toggleFavorite(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		favoritesStore.toggle(name);
	}
</script>

<a href="{base}/pokemon/{name}" class="card" data-testid="pokemon-card">
	<button
		type="button"
		class="fav-btn"
		onclick={toggleFavorite}
		aria-pressed={favoritesStore.has(name)}
		aria-label={favoritesStore.has(name) ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
	>
		<Heart size={18} fill={favoritesStore.has(name) ? 'currentColor' : 'none'} aria-hidden="true" />
	</button>
	<span class="dex-number">{dexNumber}</span>
	<div class="sprite-wrap">
		{#if sprite}
			<img src={sprite} alt="" loading="lazy" width="96" height="96" />
		{:else}
			<div class="sprite-placeholder" aria-hidden="true"></div>
		{/if}
	</div>
	<h3 class="name">{displayName}</h3>
	<div class="types">
		{#each types as type (type)}
			<span class="type-badge" style="background-color: {typeColor(type)}">{type}</span>
		{/each}
	</div>
</a>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 1.25rem 1rem 1rem;
		border-radius: 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-card);
		text-decoration: none;
		color: var(--color-text);
		transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
	}

	.card:hover,
	.card:focus-visible {
		transform: translateY(-4px) scale(1.02);
		border-color: var(--color-accent);
		outline: none;
	}

	.card:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.fav-btn {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		border: none;
		background: var(--color-surface-hover);
		color: var(--color-accent);
		cursor: pointer;
		transition: transform 0.15s ease;
	}

	.fav-btn:hover {
		transform: scale(1.15);
	}

	.dex-number {
		align-self: flex-start;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
	}

	.sprite-wrap {
		width: 96px;
		height: 96px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sprite-wrap img {
		image-rendering: pixelated;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.sprite-placeholder {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: var(--color-surface-hover);
	}

	.name {
		margin: 0;
		text-transform: capitalize;
		font-size: 1rem;
		font-weight: 700;
	}

	.types {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.type-badge {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: white;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
		.card:hover,
		.card:focus-visible {
			transform: none;
		}
	}
</style>
