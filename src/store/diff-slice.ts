import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Person } from "../services/person";

const initialState = {
	// An array of local changes made to "people" that require diff resolution by the user
	// We should fetch server data every time to make sure this works as-intended
	updatesToDiff: [] as Person[],
};

const diffSlice = createSlice({
	name: "diffs",
	initialState,
	reducers: {
		clearDiffs() {
			return initialState;
		},
		addItemToDiff(state, action: PayloadAction<Person>) {
			state.updatesToDiff.push(action.payload);
		},
		clearTopItemOffDiff(state) {
			state.updatesToDiff.shift();
		},
	},
});

export const { addItemToDiff, clearDiffs, clearTopItemOffDiff } =
	diffSlice.actions;
export const diffReducer = diffSlice.reducer;
