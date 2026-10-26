import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeOffers, readGoods, requestParts } from "./partsApi";
afterEach(() => {
  vi.unstubAllGlobals();
});
describe("API response normalization", () => {
  it("accepts both documented empty shapes", () => {
    expect(readGoods({ goods: [{}] })).toEqual([]);
    expect(readGoods({ goods: {} })).toEqual([]);
  });
  it("reports quota, API errors and malformed responses", () => {
    expect(() => readGoods({ error: "Request quota exceeded!" })).toThrow(
      "лимит",
    );
    expect(() => readGoods({ error: "Invalid key client!" })).toThrow(
      "Invalid key client!",
    );
    expect(() => readGoods({})).toThrow("список товаров");
  });
  it("flattens warehouses and nested analogues, ignores legacy price/count and preserves zero", () => {
    const analogue = {
      goodsID: "b",
      brand: "FEBI",
      warehouses: [{ id: "1", price: 200, stock: 0 }],
    };
    const goods = [
      {
        goodsID: "a",
        brand: "MEYLE",
        price: 99999,
        count: 999,
        warehouses: [
          { id: "1", price: 100, stock: 2 },
          { id: "2", price: 120, stock: 3 },
        ],
        analogues: [analogue],
      },
      analogue,
    ];
    const rows = normalizeOffers(goods);
    expect(rows).toHaveLength(3);
    expect(rows.map(({ price, stock }) => [price, stock])).toEqual([
      [100, 2],
      [120, 3],
      [200, 0],
    ]);
    expect(
      normalizeOffers([{ brand: "A", price: 99, warehouses: [] }]),
    ).toEqual([]);
  });
});
it("sends only number first, then brand and analogues=on, encoding special characters", async () => {
  const request = requestParts;
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ goods: [{}] }) });
  vi.stubGlobal("fetch", fetchMock);
  const signal = new AbortController().signal;
  await request({ number: "A#&12" }, signal);
  let url = new URL(fetchMock.mock.calls[0][0], "http://localhost");
  expect([...url.searchParams]).toEqual([["number", "A#&12"]]);
  expect(fetchMock.mock.calls[0][1].signal).toBe(signal);
  await request({ number: "A#&12", brand: "A & B" }, signal);
  url = new URL(fetchMock.mock.calls[1][0], "http://localhost");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    number: "A#&12",
    brand: "A & B",
    analogues: "on",
  });
});
it("distinguishes HTTP, JSON, network and abort failures", async () => {
  const request = requestParts;
  const mock = vi.fn();
  vi.stubGlobal("fetch", mock);
  mock.mockResolvedValueOnce({ ok: false, status: 503 });
  await expect(request({ number: "1" })).rejects.toThrow("HTTP 503");
  mock.mockResolvedValueOnce({
    ok: true,
    json: async () => {
      throw new SyntaxError();
    },
  });
  await expect(request({ number: "1" })).rejects.toThrow("JSON");
  mock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
  await expect(request({ number: "1" })).rejects.toThrow("Проверьте сеть");
  mock.mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));
  await expect(request({ number: "1" })).rejects.toHaveProperty(
    "name",
    "AbortError",
  );
});
