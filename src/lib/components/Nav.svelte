<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { theme } from '$lib/stores/theme.svelte';
	import { Sun, Moon, Heart, Search } from '@lucide/svelte';

	const links = [
		{ href: `${base}/`, label: 'Pokédex', match: `${base}/` },
		{ href: `${base}/berries`, label: 'Berries', match: `${base}/berries` },
		{ href: `${base}/favorites`, label: 'Favorites', match: `${base}/favorites` }
	];

	function isActive(match: string) {
		if (match === `${base}/`) {return page.url.pathname === `${base}/` || page.url.pathname === base;}
		return page.url.pathname.startsWith(match);
	}
</script>

<header class="nav-header">
	<div class="nav-inner">
		<a href="{base}/" class="brand">
			<Search size={20} aria-hidden="true" />
			<span>Pokédex</span>
		</a>
		<nav aria-label="Primary">
			<ul>
				{#each links as link (link.href)}
					<li>
						<a href={link.href} aria-current={isActive(link.match) ? 'page' : undefined}>
							{#if link.label === 'Favorites'}
								<Heart size={16} aria-hidden="true" />
							{/if}
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<button
			type="button"
			class="theme-toggle"
			onclick={() => theme.toggle()}
			aria-label={theme.mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
		>
			{#if theme.mode === 'dark'}
				<Sun size={18} aria-hidden="true" />
			{:else}
				<Moon size={18} aria-hidden="true" />
			{/if}
		</button>
	</div>
</header>

<style>
	.nav-header {
		position: sticky;
		top: 0;
		z-index: 40;
		backdrop-filter: blur(12px);
		background: color-mix(in oklab, var(--color-surface) 85%, transparent);
		border-bottom: 1px solid var(--color-border);
	}

	.nav-inner {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0.75rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--color-accent);
		text-decoration: none;
		margin-right: auto;
	}

	nav ul {
		display: flex;
		gap: 0.25rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	nav a {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.85rem;
		border-radius: 999px;
		text-decoration: none;
		color: var(--color-text-muted);
		font-weight: 600;
		font-size: 0.9rem;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	nav a:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	nav a[aria-current='page'] {
		background: var(--color-accent);
		color: white;
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.15s ease;
	}

	.theme-toggle:hover {
		background: var(--color-surface-hover);
		transform: scale(1.05);
	}

	.theme-toggle:focus-visible,
	nav a:focus-visible,
	.brand:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (max-width: 640px) {
		.nav-inner {
			flex-wrap: wrap;
		}
		nav ul {
			order: 3;
			width: 100%;
			justify-content: center;
		}
	}
</style>
