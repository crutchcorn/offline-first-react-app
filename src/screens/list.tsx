import { Link } from "react-router-dom";
import { useListPerson } from "../hooks/use-list-person.ts";

export const PeopleList = () => {
	const { data: people, isLoading } = useListPerson();

	const slicedPeople = people?.slice(0, 10);

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			<ul>
				{slicedPeople?.map((person) => (
					<li key={person.id}>
						<Link to={`/detail/${person.id}`}>{person.name}</Link>
					</li>
				))}
			</ul>
		</div>
	);
};
