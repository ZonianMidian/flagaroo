<script context="module" lang="ts">
	import { redirect, type HttpError } from '@sveltejs/kit';

	export function load({ error }: { error: HttpError }) {
		console.log(error);
		if (error.status === 404) {
			throw redirect(307, '/');
		}
	}
</script>
