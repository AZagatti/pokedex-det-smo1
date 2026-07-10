<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} — Pokédex</title>
</svelte:head>

<div class="error-page">
	<p class="code">{page.status}</p>
	<h1>{page.status === 404 ? 'Pokémon not found' : 'Something went wrong'}</h1>
	<p class="message">
		{page.error?.message ?? "The page you're looking for doesn't exist."}
	</p>
	<a href="{base}/" class="home-link">Back to Pokédex</a>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 5rem 1rem;
		gap: 0.5rem;
	}
	.code {
		font-size: 4rem;
		font-weight: 800;
		color: var(--color-accent);
		margin: 0;
	}
	h1 {
		margin: 0;
	}
	.message {
		color: var(--color-text-muted);
		max-width: 40ch;
	}
	.home-link {
		margin-top: 1rem;
		padding: 0.65rem 1.5rem;
		border-radius: 999px;
		background: var(--color-accent);
		color: white;
		text-decoration: none;
		font-weight: 600;
	}
</style>
