import { stringify, parse } from "superjson";
import { v4 as uuidV4 } from "uuid";
import * as fs from "fs";
import type { APIRoute } from "astro";
import { pick } from "ts-util-helpers";
import type { PersonDetailsInfo } from "../../types/api";
import { apiListPath } from "../../constants/api";

const getPersonListDetails = (person: PersonDetailsInfo) =>
	pick(person, ["id", "lastUpdated"]);

export const GET: APIRoute = () => {
	const rawList = parse<PersonDetailsInfo[]>(
		fs.readFileSync(apiListPath, "utf8"),
	);
	const list = rawList.map(getPersonListDetails);
	return new Response(stringify(list));
};

export const POST: APIRoute = async ({ request }) => {
	const body = await request.text();
	const rawPerson = parse<Omit<PersonDetailsInfo, "id">>(body);
	const person: PersonDetailsInfo = { id: uuidV4(), ...rawPerson };
	const rawList = parse<PersonDetailsInfo[]>(
		fs.readFileSync(apiListPath, "utf8"),
	);
	rawList.push(person);
	const jsonList = stringify(rawList);
	fs.writeFileSync(apiListPath, jsonList);

	return new Response(stringify(person));
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.text();
	const rawPerson = parse<PersonDetailsInfo>(body);
	const list = parse<PersonDetailsInfo[]>(fs.readFileSync(apiListPath, "utf8"));
	const person = list.find((person) => person.id === rawPerson.id);
	if (!person) {
		return new Response(body);
	}
	for (const _key of Object.keys(rawPerson)) {
		const personKey = _key as keyof typeof person;
		const rawPersonKey = _key as keyof typeof rawPerson;
		person[personKey] = rawPerson[rawPersonKey] as never;
	}
	const jsonList = stringify(list);
	fs.writeFileSync(apiListPath, jsonList);

	return new Response(stringify(person));
};

export const DELETE: APIRoute = async ({ request }) => {
	const body = await request.text();
	const { id } = parse<Pick<PersonDetailsInfo, "id">>(body);
	const list = parse<PersonDetailsInfo[]>(fs.readFileSync(apiListPath, "utf8"));
	const newList = list.filter((person) => person.id !== id);
	const jsonList = stringify(newList);
	fs.writeFileSync(apiListPath, jsonList);

	return new Response("{success: true}");
};
