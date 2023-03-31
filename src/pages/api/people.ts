import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidV4 } from "uuid";
import * as fs from "fs";

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Person[]>
) {
  if (req.method === "POST") {
    const { name, age } = req.body;
    const person: Person = { id: uuidV4(), name, age };
    const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
    list.push(person);
    fs.writeFileSync(listPath, JSON.stringify(list));
    res.status(200).json(list);
    return;
  }
  if (req.method === "GET") {
    const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
    res.status(200).json(list);
    return;
  }
  if (req.method === "PUT") {
    const { id, name, age } = req.body;
    const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
    const person = list.find((person: Person) => person.id === id);
    person.name = name;
    person.age = age;
    fs.writeFileSync(listPath, JSON.stringify(list));
    res.status(200).json(list);
    return;
  }
}
