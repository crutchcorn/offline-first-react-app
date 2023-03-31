import { useQuery } from "@tanstack/react-query";
import { getPeopleList } from "@/services/people";

export const HomeClient = () => {
  const { data: people, isLoading } = useQuery(["people"], {
    queryFn: async () => {
      return await getPeopleList();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <ul>
        {people!.map((person) => (
          <li key={person.id}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
};
