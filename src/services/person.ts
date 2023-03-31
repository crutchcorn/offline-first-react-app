import superjson from "superjson";

export interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const getPerson = (id: string) => {
	return fetch(`/api/people/${id}`)
		.then((res) => res.text())
		.then((response) => superjson.parse(response) as unknown as Person);
};
