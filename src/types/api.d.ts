export interface PersonListInfo {
	name: string;
	id: string;
	lastUpdated: Date;
}

export interface PersonDetailsInfo extends PersonListInfo {
	age: number;
	jobTitle: string;
	bio: string;
	suffix: string;
	zodiacSign: string;
}

export interface BaseProps {
	signal?: AbortSignal;
}

export interface ListDetailsProps {
	lastUpdated: Date | null;
}
