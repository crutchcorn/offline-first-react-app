import superjson from "superjson";
import * as fs from "fs";
import type { APIRoute } from "astro";

const listPath = process.cwd() + "/list.json";

interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const get: APIRoute = ({ params }) => {
	const list = superjson.parse(fs.readFileSync(listPath, "utf8")) as Person[];

	const id = params["id"];

	const person = list.find((person) => person.id === id);

	return {
		body: superjson.stringify(person),
	};
};
