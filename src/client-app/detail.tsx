import { Link, useParams } from "react-router-dom";
import { useGetPerson } from "../services/use-get-person";

export const PersonDetail = () => {
	const { id } = useParams();
	const { person, isLoading } = useGetPerson(id || "");

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			<Link to="/">Back to list</Link>
			<p>{person?.name}</p>
			<p>{person?.age}</p>
		</div>
	);
};
