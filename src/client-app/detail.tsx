import { Link, useParams } from "react-router-dom";
import { Field, Form } from "houseform";
import { useUpdatePerson } from "../services/use-update-person";
import { useQuery } from "@tanstack/react-query";
import { customerKeys } from "../constants/query-keys";
import { getPerson } from "../services/person";
import type { PersonDetailsInfo } from "../types/api";

export const PersonDetail = () => {
	const { id } = useParams();
	const { data: person, isLoading } = useQuery({
		queryKey: customerKeys.detail(id!),
		queryFn: async ({ signal }) => {
			return getPerson({ id: id!, signal });
		},
		enabled: !!id,
	});

	const { updatePerson } = useUpdatePerson(id || "");

	if (isLoading) return <div>Loading...</div>;

	return (
		<Form
			onSubmit={(values: Omit<PersonDetailsInfo, "id" | "lastUpdated">) => {
				updatePerson.mutate({
					...(person ?? { id: id! }),
					...values,
					lastUpdated: new Date(),
				});
			}}
		>
			{({ submit }) => (
				<div>
					<Link to="/">Back to list</Link>
					<Field name={"name"} initialValue={person?.name}>
						{({ value, setValue }) => (
							<input value={value} onChange={(e) => setValue(e.target.value)} />
						)}
					</Field>
					<Field name={"age"} initialValue={person?.age}>
						{({ value, setValue }) => (
							<input
								type="number"
								value={value}
								onChange={(e) => setValue(e.target.valueAsNumber || 0)}
							/>
						)}
					</Field>
					<button onClick={() => void submit}>Update</button>
				</div>
			)}
		</Form>
	);
};
