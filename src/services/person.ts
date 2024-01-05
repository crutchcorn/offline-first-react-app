import { parse } from "superjson";

export interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const getPerson = (id: string) => {
	return fetch(`/api/people/${id}`)
		.then((res) => res.text())
		.then((response) => parse<Person>(response));
};
