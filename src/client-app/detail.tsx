import { useQuery } from "@tanstack/react-query";
import { getPeopleList } from "../services/people";
import {Link, useParams} from "react-router-dom";

export const PersonDetail = () => {
  const { id } = useParams();

  const { data: people, isLoading } = useQuery(["people"], {
    queryFn: async () => {
      return await getPeopleList();
    },
  });

  const person = people?.find((person) => person.id === id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/">Back to list</Link>
      <p>{person!.name}</p>
      <p>{person!.age}</p>
    </div>
  );
};
