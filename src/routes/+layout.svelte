<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	const { children } = $props();

	theme.init();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell" data-theme={theme.mode}>
	<Nav />
	<main id="main">
		{@render children()}
	</main>
	<footer>
		<p>
			Data from <a href="https://pokeapi.co" target="_blank" rel="noreferrer">PokéAPI</a>. Not
			affiliated with Nintendo, Game Freak, or The Pokémon Company.
		</p>
	</footer>
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
		max-width: 72rem;
		width: 100%;
		margin: 0 auto;
		padding: 1.5rem 1.25rem 3rem;
	}

	footer {
		text-align: center;
		padding: 1.5rem;
		font-size: 0.8rem;
		color: var(--color-text-muted);
		border-top: 1px solid var(--color-border);
	}

	footer a {
		color: var(--color-accent);
	}
</style>
