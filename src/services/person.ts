import { parse } from "superjson";
import type { BaseProps, PersonDetailsInfo } from "../types/api";

interface GetPersonProps extends BaseProps {
	id: string;
}

export const getPerson = async ({ id, signal }: GetPersonProps) => {
	const res = await fetch(`/api/people/${id}`, { signal: signal ?? null });
	const response: string = await res.text();
	return parse<PersonDetailsInfo>(response);
};
