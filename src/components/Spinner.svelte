<script lang="ts">
	export let isDiv: Boolean;
</script>

<div class="loading" class:loading-div={isDiv}>
	<div class="spinner"></div>
</div>

<style>
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.spinner {
		border: 10px solid rgba(0, 0, 0, 0.1);
		border-left: 10px solid #767676;
		border-radius: 50%;
		width: 30vh;
		height: 30vh;
		animation: spin 2s linear infinite;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.loading-div {
		height: 100% !important;
	}
</style>
