import { parse, stringify } from "superjson";
import * as fs from "fs";
import type { APIRoute } from "astro";

import { apiListPath } from "../../../constants/api";
import type { ListDetailsProps, PersonDetailsInfo } from "../../../types/api";

export const POST: APIRoute = async ({ request }) => {
	const body = (await request.json()) as ListDetailsProps;

	const list = parse<PersonDetailsInfo[]>(fs.readFileSync(apiListPath, "utf8"));

	if (!body.lastUpdated) {
		return new Response(stringify(list));
	}

	const filteredList = list.filter((person) => {
		return person.lastUpdated > body.lastUpdated!;
	});

	return new Response(stringify(filteredList));
};
