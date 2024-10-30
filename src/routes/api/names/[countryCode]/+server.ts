import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const countryData = await import(`$data/names/${params.countryCode}.json`);
		return json(countryData.default);
	} catch (error) {
		return new Response('Names not found', { status: 404 });
	}
};
