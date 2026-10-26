import { expect, it } from "vitest";
import { demoRequest } from "./demo";
import { normalizeOffers, readGoods } from "./partsApi";
it("demo supports both search steps and empty results using the same normalizer", async () => {
  expect(readGoods(await demoRequest({ number: "01089" }))).toHaveLength(3);
  const rows = normalizeOffers(
    readGoods(await demoRequest({ number: "01089", brand: "MEYLE" })),
  );
  expect(rows).toHaveLength(6);
  expect(rows[0]).toMatchObject({ price: 1240, stock: 8 });
  expect(readGoods(await demoRequest({ number: "missing" }))).toEqual([]);
});
it("demo delay can be aborted", async () => {
  const controller = new AbortController();
  const pending = demoRequest({ number: "01089" }, controller.signal);
  controller.abort();
  await expect(pending).rejects.toHaveProperty("name", "AbortError");
});
