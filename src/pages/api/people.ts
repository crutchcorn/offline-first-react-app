import superjson from "superjson";
import { v4 as uuidV4 } from "uuid";
import * as fs from "fs";
import type { APIRoute } from "astro";

const listPath = process.cwd() + "/list.json";

// Seed the list if it doesn't exist
if (!fs.existsSync(listPath)) {
	const list = [
		{ id: uuidV4(), name: "John", age: 20, lastUpdated: new Date() },
		{ id: uuidV4(), name: "Jane", age: 21, lastUpdated: new Date() },
		{ id: uuidV4(), name: "Bob", age: 22, lastUpdated: new Date() },
	];
	fs.writeFileSync(listPath, superjson.stringify(list));
}

interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const get: APIRoute = () => {
	const list = superjson.parse(fs.readFileSync(listPath, "utf8"));
	return {
		body: superjson.stringify(list),
	};
};

export const post: APIRoute = async ({ request }) => {
	const body = await request.text();
	const { name, age, lastUpdated } = superjson.parse(body) as Person;
	const person: Person = { id: uuidV4(), name, age, lastUpdated };
	const list = superjson.parse(fs.readFileSync(listPath, "utf8")) as Person[];
	list.push(person);
	const jsonList = superjson.stringify(list);
	fs.writeFileSync(listPath, jsonList);

	return {
		body: jsonList,
	};
};

export const put: APIRoute = async ({ request }) => {
	const body = await request.text();
	const { id, name, age, lastUpdated } = superjson.parse(body) as Person;
	const list = superjson.parse<Person[]>(fs.readFileSync(listPath, "utf8"));
	const person = list.find((person) => person.id === id);
	if (!person)
		return {
			body: body,
		};
	person.name = name;
	person.age = age;
	person.lastUpdated = lastUpdated;
	const jsonList = superjson.stringify(list);
	fs.writeFileSync(listPath, jsonList);

	return {
		body: jsonList,
	};
};

export const del: APIRoute = async ({ request }) => {
	const body = await request.text();
	const { id } = superjson.parse(body) as Person;
	const list = superjson.parse<Person[]>(fs.readFileSync(listPath, "utf8"));
	const newList = list.filter((person) => person.id !== id);
	const jsonList = superjson.stringify(newList);
	fs.writeFileSync(listPath, jsonList);

	return {
		body: jsonList,
	};
};
