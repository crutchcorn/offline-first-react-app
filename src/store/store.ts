import { configureStore } from "@reduxjs/toolkit";

import { rootReducer } from "./root-reducer";
import {
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const persistedReducer = persistReducer(
	{
		key: "redux",
		storage,
		whitelist: ["diff"],
	},
	rootReducer
);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
