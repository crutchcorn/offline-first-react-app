import { Field, Form } from "houseform";
import { useQuery } from "@tanstack/react-query";
import { getPerson } from "../services/person";
import { useUpdatePerson } from "../hooks/use-update-person";
import type { PersonDetailsInfo } from "../types/api";
import { useNavigate, useParams } from "react-router-dom";
import { useMutationState } from "../hooks/useMutationState.ts";
import {
	type customerKeys,
	type GetKeyContext,
	type GetKeyData,
	getKeyRecordFromKey,
} from "../constants/query-keys.ts";
import { useMemo } from "react";
import type { Mutation } from "@tanstack/query-core";
import { mutationHasConflicts } from "../utils/mutations-utils.ts";

interface ConflictEditProps {
	person: PersonDetailsInfo;
}

const PersonConflictEdit = ({ person }: ConflictEditProps) => {
	const navigate = useNavigate();
	const { isLoading, data: serverPerson } = useQuery({
		queryKey: ["serverperson", person.id],
		queryFn: ({ signal }) => {
			return getPerson({ id: person.id, signal });
		},
		gcTime: 0,
		retry: 3,
		staleTime: 0,
	});

	const { mutate: updatePerson } = useUpdatePerson(person.id);

	if (isLoading) {
		return <p>Loading...</p>;
	}

	return (
		<Form
			onSubmit={(values: Omit<PersonDetailsInfo, "lastUpdated" | "id">) => {
				updatePerson(
					{
						...values,
						id: person.id,
						lastUpdated: new Date(),
					},
					{
						onSuccess: () => {
							navigate(-1);
						},
					},
				);
			}}
		>
			{({ submit }) => {
				return (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void submit();
						}}
					>
						<table>
							<tr>
								<th></th>
								<th>Local</th>
								<th>Server</th>
								<th>Ours</th>
							</tr>
							<Field initialValue={person.name} name={"name"}>
								{({ value, setValue, onBlur }) => {
									return (
										<tr>
											<th scope="col">Name</th>
											<td>{person.name}</td>
											<td>{serverPerson?.name}</td>
											<td>
												<input
													name={"name"}
													value={value}
													onBlur={onBlur}
													onChange={(e) => setValue(e.target.value)}
												/>
											</td>
										</tr>
									);
								}}
							</Field>
							<Field initialValue={person.age} name={"age"}>
								{({ value, setValue, onBlur }) => {
									return (
										<tr>
											<th scope="col">Age</th>
											<td>{person.age}</td>
											<td>{serverPerson?.age}</td>
											<td>
												<input
													name={"age"}
													value={value}
													onBlur={onBlur}
													type="number"
													onChange={(e) =>
														setValue(e.target.valueAsNumber || 0)
													}
												/>
											</td>
										</tr>
									);
								}}
							</Field>
						</table>
						<button type="submit">Submit</button>
					</form>
				);
			}}
		</Form>
	);
};

interface PersonSyncDetailsProps {
	mutation: Mutation<unknown, Error, unknown, unknown>;
}

const PersonSyncDetails = ({ mutation: _mutation }: PersonSyncDetailsProps) => {
	const mutation = _mutation as never as Mutation<
		GetKeyData<typeof customerKeys.details>,
		Error,
		GetKeyData<typeof customerKeys.details>,
		GetKeyContext<typeof customerKeys.details>
	>;

	const hasConflict = useMemo(
		() => mutationHasConflicts(mutation.state),
		[mutation],
	);

	if (hasConflict) {
		return <PersonConflictEdit person={mutation.state.variables!} />;
	}

	return (
		<>
			<p>Type: Person</p>
			<p>Name: {mutation.state.variables?.name}</p>
			<p>Age: {mutation.state.variables?.age}</p>
		</>
	);
};

export const SyncDetails = () => {
	const { id } = useParams();

	const mutation = useMutationState({
		select: (m) => m,
		filters: {
			predicate: (mutation) => mutation.mutationId === Number(id),
		},
	})[0];

	const matchedKeyMeta = useMemo(
		() =>
			mutation
				? getKeyRecordFromKey(
						mutation.options.mutationKey!,
						mutation.state.variables,
					)
				: undefined,
		[mutation],
	);

	if (!mutation) return <p>404 sync detail not found</p>;

	switch (matchedKeyMeta?.type) {
		case "person":
			return <PersonSyncDetails mutation={mutation} />;
		default:
			return null;
	}
};
