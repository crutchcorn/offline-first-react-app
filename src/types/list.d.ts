import type { PersonDetailsInfo } from "./api";

export type StoredCustomerList = Pick<
	PersonDetailsInfo,
	"name" |
	"id" |
	"lastUpdated"
>[]
