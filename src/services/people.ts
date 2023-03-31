import superjson from "superjson";

export interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const getPeopleList = () => {
	return fetch("/api/people")
		.then((res) => res.text())
		.then((response) => superjson.parse(response) as unknown as Person[]);
};

export const updatePerson = (person: Omit<Person, "lastUpdated">) => {
	return fetch("/api/people", {
		method: "PUT",
		body: superjson.stringify({ ...person, lastUpdated: new Date() }),
	})
		.then((res) => res.text())
		.then((response) => superjson.parse(response) as unknown as Person[]);
};

export const addPerson = (person: Omit<Person, "id" | "lastUpdated">) => {
	return fetch("/api/people", {
		method: "POST",
		body: superjson.stringify({ ...person, lastUpdated: new Date() }),
	})
		.then((res) => res.text())
		.then((response) => superjson.parse(response) as unknown as Person[]);
};
