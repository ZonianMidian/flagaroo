import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const countryData = await import(`$data/languages/${params.langCode}.json`);
		return json(countryData.default);
	} catch (error) {
		return new Response('Language not found', { status: 404 });
	}
};
