import { expect, it, vi } from "vitest";
vi.mock("../api/partsApi", () => ({
  requestParts: vi.fn(),
  normalizeOffers: vi.fn((goods) => goods),
}));
import { requestParts } from "../api/partsApi";
import { createStore } from "./store";
import {
  fetchBrands,
  fetchOffers,
  selectBrand,
  setSearchNumber,
} from "./partsSlice";
it("extracts unique brands", async () => {
  requestParts.mockResolvedValueOnce([
    { brand: "MEYLE" },
    { brand: "MEYLE" },
    { brand: "FEBI" },
  ]);
  const store = createStore();
  await store.dispatch(fetchBrands("1"));
  expect(store.getState().parts.brands).toEqual(["MEYLE", "FEBI"]);
});
it("clears selected brand and offers immediately and ignores a late response after editing", async () => {
  const store = createStore();
  store.dispatch(selectBrand("MEYLE"));
  let resolve;
  requestParts.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const pending = store.dispatch(fetchOffers({ number: "1", brand: "MEYLE" }));
  store.dispatch(setSearchNumber("2"));
  resolve([{ brand: "MEYLE" }]);
  await pending;
  expect(store.getState().parts).toMatchObject({
    searchNumber: "2",
    selectedBrand: null,
    offers: [],
    offersStatus: "idle",
  });
});
it("newest request wins even when older response arrives last", async () => {
  let resolveOld;
  requestParts.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolveOld = done;
      }),
  );
  requestParts.mockResolvedValueOnce([{ brand: "NEW" }]);
  const store = createStore();
  const old = store.dispatch(fetchBrands("old"));
  await store.dispatch(fetchBrands("new"));
  resolveOld([{ brand: "OLD" }]);
  await old;
  expect(store.getState().parts.brands).toEqual(["NEW"]);
});
it("aborting a thunk cancels its transport signal without displaying an error", async () => {
  let signal;
  requestParts.mockImplementationOnce((_, received) => {
    signal = received;
    return new Promise(() => {});
  });
  const store = createStore();
  const pending = store.dispatch(fetchBrands("1"));
  pending.abort();
  await pending;
  expect(signal.aborted).toBe(true);
  expect(store.getState().parts).toMatchObject({
    brandsStatus: "idle",
    error: null,
  });
});
