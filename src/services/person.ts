import { parse } from "superjson";
import type { PersonDetailsInfo } from "../types/api";

export const getPerson = async (id: string) => {
	const res = await fetch(`/api/people/${id}`);
	const response: string = await res.text();
	return parse<PersonDetailsInfo>(response);
};
