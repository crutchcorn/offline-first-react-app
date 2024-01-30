import { Field, Form } from "houseform";
import { useQuery } from "@tanstack/react-query";
import { getPerson } from "../services/person.ts";
import { Dialog } from "../components/dialog/dialog.tsx";
import { useUpdatePerson } from "../hooks/use-update-person.ts";
import type {PersonDetailsInfo} from "../types/api";

interface IndividualDiffHandler {
	person: PersonDetailsInfo;
	close: () => void;
}

// TODO: Add link to this from the sync view
export const IndividialDiffHandler = ({ person, close }: IndividualDiffHandler) => {
	const { isLoading, data: serverPerson } = useQuery({
		queryKey: ["serverperson", person.id],
		queryFn: ({signal}) => {
			return getPerson({id: person.id, signal});
		},
		gcTime: 0,
		retry: 3,
		staleTime: 0,
	});

	const { mutate: updatePerson } = useUpdatePerson(person.id);

	if (isLoading) {
		return (
			<Dialog>
				<p>Loading...</p>
			</Dialog>
		);
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
								close();
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
