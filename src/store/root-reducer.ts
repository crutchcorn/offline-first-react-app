import { combineReducers } from "@reduxjs/toolkit";
import { diffReducer } from "./diff-slice";

export const rootReducer = combineReducers({
	diff: diffReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
