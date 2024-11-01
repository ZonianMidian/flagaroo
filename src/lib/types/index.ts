export type CountryData = {
	name: { [key: string]: string };
	alt: string[];
};

export type Category = {
	[key: string]: string[];
};

export type LanguageData = {
	[key: string]: string;
};

export type UmamiEvent = {
	mode: string;
	time?: number;
	percentTry: boolean;
	percentEnd: boolean;
	answersEnd: boolean;
	soundEffects: boolean;
};
