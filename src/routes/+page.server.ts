import type { Category, CountryData } from '$types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categoriesFiles = import.meta.glob<{ default: Category }>('$data/categories/*.json');
	const categories: Record<string, Category> = {};

	for (const path in categoriesFiles) {
		const module = await categoriesFiles[path]();
		const categoryName = path.split('/').pop()?.replace('.json', '') || '';
		categories[categoryName] = module.default;
	}

	const countriesFiles = import.meta.glob<{ default: CountryData }>('$data/names/*.json');
	const allFlags = [];
	for (const path in countriesFiles) {
		const countryCode = path.split('/').pop()?.replace('.json', '') || '';
		allFlags.push(countryCode);
	}

	return {
		categories,
		allFlags
	};
};
