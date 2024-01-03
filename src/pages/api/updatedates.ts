import { parse, stringify } from "superjson";
import * as fs from "fs";
import type { APIRoute } from "astro";

const listPath = process.cwd() + "/list.json";

interface Person {
	id: string;
	name: string;
	age: number;
	lastUpdated: Date;
}

export const GET: APIRoute = () => {
	const list = parse<Person[]>(fs.readFileSync(listPath, "utf8"));
	for (let i = 0; i < list.length; i++) {
		list[i]!.lastUpdated = new Date();
	}

	const jsonList = stringify(list);
	fs.writeFileSync(listPath, jsonList);

	return new Response(jsonList);
};
