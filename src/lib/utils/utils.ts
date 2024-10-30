import type { CountryData } from '$types';

export async function loadCountryData(countryCode: string): Promise<CountryData | null> {
	try {
		const response = await fetch(`/api/names/${countryCode}`);
		if (!response.ok) throw new Error('Failed to load country data');
		return await response.json();
	} catch (error) {
		console.error(`Error loading data for ${countryCode}:`, error);
		return null;
	}
}

function normalizeText(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function calculateSimilarity(str1: string, str2: string): number {
	const len1 = str1.length;
	const len2 = str2.length;

	if (len1 === 0) return len2 === 0 ? 100 : 0;
	if (len2 === 0) return 0;

	const minLen = Math.min(len1, len2);
	let matchCount = 0;
	for (let i = 0; i < minLen; i++) {
		if (str1[i] === str2[i]) matchCount++;
	}

	return (matchCount / Math.max(len1, len2)) * 100;
}

export function checkMatch(
	jsonObj: any,
	langIso: string,
	userInput: string
): { success: boolean; percent: string } {
	const normalizedInput = normalizeText(userInput);
	let minSimilarity = 70;
	let maxPercent = 0;

	if (jsonObj.name[langIso]) {
		const normalizedLangName = normalizeText(jsonObj.name[langIso]);
		const similarity = calculateSimilarity(normalizedLangName, normalizedInput);
		if (similarity >= minSimilarity) {
			return { success: true, percent: `${similarity.toFixed(2)}%` };
		}
		maxPercent = Math.max(maxPercent, similarity);
	}

	if (langIso !== 'en' && jsonObj.name['en']) {
		const normalizedEnglishName = normalizeText(jsonObj.name['en']);
		const similarity = calculateSimilarity(normalizedEnglishName, normalizedInput);
		if (similarity >= minSimilarity) {
			return { success: true, percent: `${similarity.toFixed(2)}%` };
		}
		maxPercent = Math.max(maxPercent, similarity);
	}

	for (const altName of jsonObj.alt) {
		const normalizedAltName = normalizeText(altName);
		const similarity = calculateSimilarity(normalizedAltName, normalizedInput);
		if (similarity >= minSimilarity) {
			return { success: true, percent: `${similarity.toFixed(2)}%` };
		}
		maxPercent = Math.max(maxPercent, similarity);
	}

	for (const lang in jsonObj.name) {
		const normalizedName = normalizeText(jsonObj.name[lang]);
		const similarity = calculateSimilarity(normalizedName, normalizedInput);
		if (similarity >= minSimilarity) {
			return { success: true, percent: `${similarity.toFixed(2)}%` };
		}
		maxPercent = Math.max(maxPercent, similarity);
	}

	return { success: false, percent: `${maxPercent.toFixed(2)}%` };
}

export function formatTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	let result = '';

	if (hours > 0) {
		result += `${hours}h`;
		if (minutes > 0) result += ` ${minutes}m`;
	} else if (minutes > 0) {
		result += `${minutes}m`;
		if (remainingSeconds > 0) result += ` ${remainingSeconds}s`;
	} else {
		result += `${remainingSeconds}s`;
	}

	return result.trim();
}
