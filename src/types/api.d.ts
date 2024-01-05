export interface PersonListInfo {
	id: string;
	lastUpdated: Date;
}

export interface PersonDetailsInfo extends PersonListInfo {
	name: string;
	age: number;
	jobTitle: string;
	bio: string;
	suffix: string;
	zodiacSign: string;
}

export interface BaseProps {
	signal?: AbortSignal
}
