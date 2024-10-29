export function getCountryName(country, lang) {
	return country.tags[`name:${lang}`] || country.tags['name:en'] || country.tags.name;
}

export function getAltCountryName(country, lang) {
	if (lang) {
		return country.tags[`alt_name:${lang}`]?.split(';');
	}
	return country.tags[`alt_name`]?.split(';');
}

export function getCountryCode(country) {
	return country.tags.country_code_iso3166_1_alpha_2 || country.tags['ISO3166-1:alpha2'];
}
