import {parse, stringify} from "superjson";
import * as fs from "fs";
import type { APIRoute } from "astro";

const listPath = process.cwd() + "/list.json";

interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const GET: APIRoute = ({ params }) => {
	const list = parse<Person[]>(fs.readFileSync(listPath, "utf8"));

	const id = params["id"];

	const person = list.find((person) => person.id === id);

	return new Response(stringify(person))
};
