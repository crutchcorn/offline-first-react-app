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

export const get: APIRoute = () => {
	const list = superjson.parse(fs.readFileSync(listPath, "utf8")) as Person[];
	for (let i = 0; i < list.length; i++) {
		list[i]!.lastUpdated = new Date();
	}

	const jsonList = superjson.stringify(list);
	fs.writeFileSync(listPath, jsonList);

	return {
		body: list,
	};
};
