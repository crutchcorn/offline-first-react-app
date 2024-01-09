import { Link } from "react-router-dom";
import {useListPerson} from "../services/use-list-person";

export const PeopleList = () => {
	const { data: people, isLoading } = useListPerson();

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			<ul>
				{people?.map((person) => (
					<li key={person.id}>
						<Link to={`/detail/${person.id}`}>{person.name}</Link>
					</li>
				))}
			</ul>
		</div>
	);
};
