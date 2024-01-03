import { stringify, parse } from "superjson";
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
	fs.writeFileSync(listPath, stringify(list));
}

interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const GET: APIRoute = () => {
	const list = parse(fs.readFileSync(listPath, "utf8"));
	return new Response(stringify(list))
};

export const POST: APIRoute = async ({ request }) => {
	const body = await request.text();
	const { name, age, lastUpdated } = parse<Person>(body);
	const person: Person = { id: uuidV4(), name, age, lastUpdated };
	const list = parse<Person[]>(fs.readFileSync(listPath, "utf8"));
	list.push(person);
	const jsonList = stringify(list);
	fs.writeFileSync(listPath, jsonList);

	return new Response(jsonList)
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.text();
	const { id, name, age, lastUpdated } = parse<Person>(body);
	const list = parse<Person[]>(fs.readFileSync(listPath, "utf8"));
	const person = list.find((person) => person.id === id);
	if (!person) {
		return new Response(body)
	}
	person.name = name;
	person.age = age;
	person.lastUpdated = lastUpdated;
	const jsonList = stringify(list);
	fs.writeFileSync(listPath, jsonList);

	return new Response(jsonList)
};

export const DELETE: APIRoute = async ({ request }) => {
	const body = await request.text();
	const { id } = parse<Person>(body);
	const list = parse<Person[]>(fs.readFileSync(listPath, "utf8"));
	const newList = list.filter((person) => person.id !== id);
	const jsonList = stringify(newList);
	fs.writeFileSync(listPath, jsonList);

	return new Response(jsonList)
};
