import { Link, useParams } from "react-router-dom";
import { useGetPerson } from "../services/use-get-person";
import { Field, Form } from "houseform";
import type { Person } from "../services/people";
import { useUpdatePerson } from "../services/use-update-person";

export const PersonDetail = () => {
	const { id } = useParams();
	const { person, isLoading } = useGetPerson(id || "");

	const { updatePerson } = useUpdatePerson(id || "");

	if (isLoading) return <div>Loading...</div>;

	return (
		<Form
			onSubmit={(values: Omit<Person, "id" | "lastUpdated">) => {
				updatePerson.mutate({
					id: person?.id || "",
					lastUpdated: new Date(),
					...values,
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
								value={value}
								onChange={(e) => setValue(e.target.valueAsNumber || 0)}
							/>
						)}
					</Field>
					<button onClick={submit}>Update</button>
				</div>
			)}
		</Form>
	);
};
