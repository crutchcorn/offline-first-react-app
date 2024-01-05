import { parse, stringify } from "superjson";
import * as fs from "fs";
import type { APIRoute } from "astro";

import { apiListPath } from "../../../constants/api";
import type { PersonDetailsInfo } from "../../../types/api";

export const GET: APIRoute = () => {
	const list = parse<PersonDetailsInfo[]>(fs.readFileSync(apiListPath, "utf8"));

	return new Response(stringify(list));
};
