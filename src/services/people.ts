import { stringify, parse } from "superjson";

export interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const getPeopleList = () => {
	return fetch("/api/people")
		.then((res) => res.text())
		.then((response) => parse<Person[]>(response));
};

export const updatePerson = (person: Omit<Person, "lastUpdated">) => {
	return fetch("/api/people", {
		method: "PUT",
		body: stringify({ ...person, lastUpdated: new Date() }),
	})
		.then((res) => res.text())
		.then((response) => parse<Person[]>(response));
};

export const addPerson = (person: Omit<Person, "id" | "lastUpdated">) => {
	return fetch("/api/people", {
		method: "POST",
		body: stringify({ ...person, lastUpdated: new Date() }),
	})
		.then((res) => res.text())
		.then((response) => parse<Person[]>(response));
};
