import type { PersonDetailsInfo, PersonListInfo } from "../types/api";
import { pick } from "ts-util-helpers";

export const convertPersonDetailsToPersonList = (personDetails: PersonDetailsInfo): PersonListInfo => {
	return pick(personDetails, ["id", "name", "lastUpdated"]) as PersonListInfo;
}
