<script lang="ts">
	import { t } from 'svelte-i18n';
</script>

<footer>
	<div class="footer-content">
		<a href="https://github.com/ZonianMidian/flagaroo" target="_blank" aria-label="GitHub">
			<svg
				height="24"
				width="24"
				viewBox="0 0 16 16"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.68 7.68 0 0 1 8 4.68c.68.003 1.37.092 2.01.27 1.52-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
			</svg>
		</a>
	</div>

	<!-- <div class="disclaimer">
		ZonianMidian
	</div> -->
</footer>

<style>
	:global(main) {
		min-height: calc(100vh - 64px);
		overflow: auto;
	}

	:global(main > *:not(footer)) {
		flex: 1 0 auto;
	}

	footer {
		background-color: #252525;
		padding: 1rem;
		flex-shrink: 0;
		margin-top: 1rem;
	}

	.footer-content {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.footer-content svg {
		vertical-align: middle;
	}

	.footer-content a {
		color: white;
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s;
		text-align: center;
	}

	.footer-content a:hover {
		color: #d1d5db;
	}

	/* .disclaimer {
		color: #a0a0a0;
		font-size: 0.8rem;
		text-align: center;
	} */
</style>
