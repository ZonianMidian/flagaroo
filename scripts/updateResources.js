import fs from 'fs';

import countriesData from '../src/lib/data/data.json' with { type: 'json' };
import supportedLangs from '../supportedLangs.json' with { type: 'json' };
import patches from './patches.json' with { type: 'json' };

import { getCountryName, getCountryCode, getAltCountryName } from './utils.js';

const countries = countriesData.elements
	.filter((country) => typeof getCountryCode(country) === 'string')
	.sort((a, b) => (getCountryName(a, 'en') < getCountryName(b, 'en') ? -1 : 1));

for (const country of countries) {
	let countryCode = getCountryCode(country).toLowerCase();
	const data = {
		name: {},
		alt: []
	};

	supportedLangs.forEach((lang) => {
		data.name[lang] = getCountryName(country, lang);
		if (patches[countryCode]) {
			const patch = patches[countryCode].name?.find((entry) => entry.key === lang);
			if (patch) {
				data.name[lang] = patch.value;
			}
		}

		const alt = getAltCountryName(country, lang);
		if (alt) {
			data.alt = [...data.alt, ...alt];
		}
	});

	let alt = getAltCountryName(country) ?? [];
	if (patches[countryCode]?.alt) {
		alt = [...patches[countryCode].alt, ...alt];
	}
	if (alt.length > 0) {
		data.alt = [...data.alt, ...alt];
	}

	if (patches[countryCode]?.code) {
		countryCode = patches[countryCode].code;
	}

	fs.writeFileSync(`./src/lib/data/names/${countryCode}.json`, JSON.stringify(data, null, 2));
}

console.log('Update done!');
