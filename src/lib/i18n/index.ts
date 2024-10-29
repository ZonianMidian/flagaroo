import { getLocaleFromNavigator, init, register } from 'svelte-i18n';
import { browser } from '$app/environment';

const defaultLocale = 'en';

const context = import.meta.glob('$locales/*.json');
Object.keys(context).forEach((key) => {
	const match = key.match(/\/([^\/]+)\.json/);
	if (match) {
		const locale = match[1];
		register(locale, () => {
			return import(`$locales/${locale}.json`);
		});
	}
});

function getInitialLocale() {
	if (!browser) {
		return defaultLocale;
	}
	const savedLocale = window.localStorage.getItem('locale');
	return savedLocale ?? getLocaleFromNavigator();
}

init({
	fallbackLocale: defaultLocale,
	initialLocale: getInitialLocale()
});
