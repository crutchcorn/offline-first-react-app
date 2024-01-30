import { Link, useParams } from "react-router-dom";
import { Field, Form } from "houseform";
import { useUpdatePerson } from "../hooks/use-update-person.ts";
import { useMutationState, useQuery } from "@tanstack/react-query";
import { customerKeys, type GetKeyData } from "../constants/query-keys";
import { getPerson } from "../services/person";
import type { PersonDetailsInfo } from "../types/api";
import { useMemo } from "react";
import { mutationHasConflicts } from "../utils/mutations-utils.ts";
import { stringify } from "superjson";

export const PersonDetail = () => {
	const { id } = useParams();

	const { data: person, isLoading } = useQuery({
		queryKey: customerKeys.detail(id!).key,
		queryFn: async ({
			signal,
		}): Promise<GetKeyData<typeof customerKeys.detail>> => {
			return getPerson({ id: id!, signal });
		},
		enabled: !!id,
	});

	// Conflicts are always represented as errors
	const mutations = useMutationState({
		filters: {
			mutationKey: customerKeys.detail(id!).key,
			predicate: (mutation) => mutation.state.status === "error",
		},
	});

	const isLocked = useMemo(() => {
		return mutations.some(
			(mutationState) => !!mutationHasConflicts(mutationState),
		);
	}, [mutations]);

	const { mutate: updatePerson, error } = useUpdatePerson(id || "");

	if (isLoading) return <div>Loading...</div>;

	return (
		<Form
			onSubmit={(values: Omit<PersonDetailsInfo, "id" | "lastUpdated">) => {
				if (isLocked) return;
				updatePerson({
					...(person ?? { id: id! }),
					...values,
					lastUpdated: new Date(),
				});
			}}
		>
			{({ submit }) => (
				<div>
					{error ? <p>There was an error: {stringify(error)}</p> : null}
					{isLocked && (
						<div style={{ background: "yellow", padding: "1rem" }}>
							<p style={{ margin: 0 }}>
								This person is locked, please see the sync screen for more
								details
							</p>
							<Link to={"/sync"}>Go to sync</Link>
						</div>
					)}
					<h1>Person Detail</h1>
					<Field name={"name"} initialValue={person?.name}>
						{({ value, setValue }) => (
							<input
								disabled={isLocked}
								value={value}
								onChange={(e) => setValue(e.target.value)}
							/>
						)}
					</Field>
					<Field name={"age"} initialValue={person?.age}>
						{({ value, setValue }) => (
							<input
								disabled={isLocked}
								type="number"
								value={value}
								onChange={(e) => setValue(e.target.valueAsNumber || 0)}
							/>
						)}
					</Field>
					<button disabled={isLocked} onClick={() => void submit()}>
						Update
					</button>
				</div>
			)}
		</Form>
	);
};
