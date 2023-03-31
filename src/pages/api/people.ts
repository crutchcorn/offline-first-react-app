import { v4 as uuidV4 } from "uuid";
import * as fs from "fs";
import type { APIRoute } from "astro";

const listPath = process.cwd() + "/list.json";

// Seed the list if it doesn't exist
if (!fs.existsSync(listPath)) {
  const list = [
    { id: uuidV4(), name: "John", age: 20 },
    { id: uuidV4(), name: "Jane", age: 21 },
    { id: uuidV4(), name: "Bob", age: 22 },
  ];
  fs.writeFileSync(listPath, JSON.stringify(list));
}

interface Person {
  id: string;
  name: string;
  age: number;
}

export const get: APIRoute = () => {
  const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
  return {
    body: JSON.stringify(list),
  };
};

export const post: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { name, age } = body;
  const person: Person = { id: uuidV4(), name, age };
  const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
  list.push(person);
  fs.writeFileSync(listPath, JSON.stringify(list));

  return {
    body: JSON.stringify(list),
  };
};

export const put: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { id, name, age } = body;
  const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
  const person = list.find((person: Person) => person.id === id);
  person.name = name;
  person.age = age;
  fs.writeFileSync(listPath, JSON.stringify(list));

  return {
    body: JSON.stringify(list),
  };
};

export const del: APIRoute = () => {
  return {
    body: JSON.stringify({
      message: "This was a DELETE!",
    }),
  };
};
