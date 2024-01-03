import { useQuery } from "@tanstack/react-query";
import { getPeopleList } from "../services/people";
import { Link } from "react-router-dom";

export const PeopleList = () => {
	const { data: people, isLoading } = useQuery({
		queryKey: ["people"],
		queryFn: async () => {
			return await getPeopleList();
		},
	});

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
