interface Person {
  id: string;
  name: string;
  age: number;
}

export const getPeopleList = () => {
  return fetch("/api/people").then(
    (response) => response.json() as unknown as Person[]
  );
};

export const updatePerson = (person: Person) => {
  return fetch("/api/people", {
    method: "PUT",
    body: JSON.stringify(person),
  }).then((response) => response.json() as unknown as Person[]);
};

export const addPerson = (person: Omit<Person, "id">) => {
  return fetch("/api/people", {
    method: "POST",
    body: JSON.stringify(person),
  }).then((response) => response.json() as unknown as Person[]);
};
