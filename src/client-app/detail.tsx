import { useQueryClient } from "@tanstack/react-query";
import { Person } from "../services/people";
import { Link, useParams } from "react-router-dom";

export const PersonDetail = () => {
	const { id } = useParams();
	const queryClient = useQueryClient();
	const people = queryClient.getQueryData<Array<Person>>(["people"]);

	const person = people?.find((p) => p.id === id);

	return (
		<div>
			<Link to="/">Back to list</Link>
			<p>{person?.name}</p>
			<p>{person?.age}</p>
		</div>
	);
};
