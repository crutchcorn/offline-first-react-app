export interface PersonListInfo {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export interface PersonDetailsInfo extends PersonListInfo {
	jobTitle: string;
	bio: string;
	suffix: string;
	zodiacSign: string;
}
