// Seed the list if it doesn't exist
import fs from "fs";
import {apiListPath} from "../src/constants/api.ts";
import {v4 as uuidV4} from "uuid";
import {faker} from "@faker-js/faker";
import {stringify} from "superjson";

if (!fs.existsSync(apiListPath)) {
  const list = Array.from({ length: 15000 }, () => ({
    // LIST information
    id: uuidV4(),
    lastUpdated: new Date(),
    // DETAIL information
    name: faker.person.firstName(),
    age: faker.number.int({ min: 18, max: 70 }),
    jobTitle: faker.person.jobTitle(),
    bio: faker.person.bio(),
    suffix: faker.person.suffix(),
    zodiacSign: faker.person.zodiacSign(),
  }));
  fs.writeFileSync(apiListPath, stringify(list));
}
