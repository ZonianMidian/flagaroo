import type { CountryData, Category } from '$types';
import { writable } from 'svelte/store';

export const countriesStore = writable<Record<string, CountryData>>({});
export const categoriesStore = writable<Record<string, Category>>({});
