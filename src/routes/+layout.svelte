<script lang="ts">
	import Spinner from '$components/Spinner.svelte';
	import Footer from '$components/Footer.svelte';
	import { navigating } from '$app/stores';
</script>

<svelte:head>
	<title>Flagaroo</title>

	<meta property="og:site_name" content="Flagaroo" />
	<meta property="og:type" content="website" />
</svelte:head>

<main>
	<img src={`./Flagaroo.png`} alt="Flagaroo" class="logo" />
	<h1>Flagaroo</h1>
	{#if $navigating}
		<Spinner />
	{:else}
		<slot />
	{/if}
</main>

<Footer />

<style>
	h1 {
		text-align: center;
		font-size: 2.5em;
		color: #ffffff;
		margin-top: 0;
	}

	.logo {
		display: block;
		margin-left: auto;
		margin-right: auto;
		margin-top: 1rem;
		width: 5rem;
	}
</style>
