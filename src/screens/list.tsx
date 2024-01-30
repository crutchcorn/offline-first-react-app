import { Link } from "react-router-dom";
import { useListPerson } from "../hooks/use-list-person.ts";
import {useState} from "react";

export const PeopleList = () => {
	const { data: people, isLoading } = useListPerson();

	const [page, setPage] = useState(0);

	const minPage = 0;
	const maxPage = Math.floor((people?.length ?? 0) / 10);

	const isMinPage = page === minPage;
	const isMaxPage = page === maxPage;

	const slicedPeople = people?.slice(page * 10, (page + 1) * 10);

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
			<button disabled={isMinPage} onClick={() => setPage(isMinPage ? 0 : page - 1)}>Previous page</button>
			<button disabled={isMaxPage} onClick={() => setPage(isMaxPage ? page : page + 1)}>Next</button>
		</div>
	);
};
