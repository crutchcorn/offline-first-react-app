import { useAppDispatch, useAppSelector } from "../store/store";
import { createPortal } from "react-dom";
import { Field, Form } from "houseform";
import { onlineManager, useQuery } from "@tanstack/react-query";
import { getPerson } from "../services/person";
import { Dialog } from "../components/dialog/dialog";
import { useUpdatePerson } from "../services/use-update-person";
import { clearTopItemOffDiff } from "../store/diff-slice";
import type {PersonDetailsInfo} from "../types/api";

interface IndividualDiffHandler {
	person: PersonDetailsInfo;
	close: () => void;
}

const IndividialDiffHandler = ({ person, close }: IndividualDiffHandler) => {
	const { isLoading, data: serverPerson } = useQuery({
		queryKey: ["serverperson", person.id],
		queryFn: ({signal}) => {
			return getPerson({id: person.id, signal});
		},
		gcTime: 0,
		retry: 3,
		staleTime: 0,
	});

	const { updatePerson } = useUpdatePerson(person.id);

	if (isLoading) {
		return (
			<Dialog>
				<p>Loading...</p>
			</Dialog>
		);
	}

	return (
		<Dialog>
			<Form
				onSubmit={(values: Omit<PersonDetailsInfo, "lastUpdated" | "id">) => {
					updatePerson.mutate(
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
		</Dialog>
	);
};

export const DiffHandler = () => {
	const isOnline = onlineManager.isOnline();
	const updatesToDiff = useAppSelector((state) => state.diff.updatesToDiff);
	const dispatch = useAppDispatch();

	if (!updatesToDiff || updatesToDiff.length === 0) {
		return null;
	}

	if (!isOnline) return null;

	return createPortal(
		<div>
			<IndividialDiffHandler
				person={updatesToDiff[0]!}
				close={() => {
					dispatch(clearTopItemOffDiff());
				}}
			/>
		</div>,
		document.querySelector("#portal-injection")!,
	);
};
