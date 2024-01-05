import { stringify, parse } from "superjson";
import type { PersonDetailsInfo, PersonListInfo } from "../types/api";

interface BaseProps {
	signal: AbortSignal
}

export const getPeopleIdList = async ({signal}: BaseProps) => {
	const res = await fetch("/api/people", {signal});
	const response: string = await res.text();
	return parse<PersonListInfo[]>(response);
};

export const getPeopleDatabaseList = async ({signal}: BaseProps) => {
	const res = await fetch("/api/people/list-details", {signal});
	const response: string = await res.text();
	return parse<PersonDetailsInfo[]>(response);
};

interface UpdatePersonProps extends BaseProps {
	person: Omit<PersonDetailsInfo, "lastUpdated">
}

export const updatePerson = async ({person, signal}: UpdatePersonProps) => {
	const res = await fetch("/api/people", {
		method: "PUT",
		signal,
		body: stringify({ ...person, lastUpdated: new Date() })
	});
	const response: string = await res.text();
	return parse<PersonDetailsInfo[]>(response);
};

interface AddPersonProps extends BaseProps {
	person: Omit<PersonDetailsInfo, "id" | "lastUpdated">
}

export const addPerson = async ({ signal, person }: AddPersonProps) => {
	const res = await fetch("/api/people", {
		method: "POST",
		signal,
		body: stringify({ ...person, lastUpdated: new Date() })
	});
	const response: string = await res.text();
	return parse<PersonDetailsInfo[]>(response);
};
