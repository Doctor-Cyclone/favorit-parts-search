import { configureStore } from "@reduxjs/toolkit";
import partsReducer from "./partsSlice";
export const createStore = () =>
  configureStore({ reducer: { parts: partsReducer } });
export const store = createStore();
