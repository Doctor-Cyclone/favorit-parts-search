import { test, expect } from "@playwright/test";
const product = {
  goodsID: "1",
  brand: "MEYLE",
  number: "01089",
  name: "Ролик натяжителя",
  price: 99999,
  warehouses: [
    { id: "MS2", price: 1240, stock: 8 },
    { id: "MS1", price: 1390, stock: 0 },
  ],
  analogues: [
    {
      goodsID: "2",
      brand: "FEBI",
      name: "Аналог ролика",
      warehouses: [{ id: "MS2", price: 1600, stock: 3 }],
    },
  ],
};
test("debounce, two-step API contract, warehouse rows and immediate reset", async ({
  page,
}) => {
  const calls = [];
  await page.route("**/api/parts?**", async (route) => {
    const query = Object.fromEntries(
      new URL(route.request().url()).searchParams,
    );
    calls.push(query);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      json: {
        goods: query.brand
          ? [product]
          : [product, { brand: "MEYLE" }, { brand: "FEBI" }],
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Найти", exact: true }),
  ).toBeDisabled();
  const input = page.getByLabel("Артикул детали");
  await input.fill("0");
  await page.waitForTimeout(150);
  await input.fill("01089");
  await page.waitForTimeout(250);
  expect(calls).toHaveLength(0);
  await expect(page.getByRole("button", { name: "MEYLE" })).toBeVisible();
  expect(calls).toEqual([{ number: "01089" }]);
  await page.getByRole("button", { name: "MEYLE" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  expect(calls[1]).toEqual({
    number: "01089",
    brand: "MEYLE",
    analogues: "on",
  });
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await expect(page.getByText("0 шт.", { exact: true })).toBeVisible();
  await expect(page.getByRole("table")).not.toContainText("99 999");
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await input.fill("OC90");
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("button", { name: "Очистить артикул" }).click();
  await expect(
    page.getByRole("button", { name: "Найти", exact: true }),
  ).toBeDisabled();
});
test("empty brands, API quota, retry, network failure and empty offers", async ({
  page,
}) => {
  let attempt = 0;
  await page.route("**/api/parts?**", async (route) => {
    const query = new URL(route.request().url()).searchParams;
    if (query.get("number") === "empty")
      return route.fulfill({ json: { goods: [{}] } });
    if (query.get("number") === "network") return route.abort();
    if (query.get("number") === "quota" && attempt++ === 0)
      return route.fulfill({ json: { error: "Request quota exceeded!" } });
    return route.fulfill({
      json: { goods: [{ brand: "MEYLE", warehouses: [] }] },
    });
  });
  await page.goto("/");
  const input = page.getByLabel("Артикул детали");
  await input.fill("empty");
  await expect(page.getByText("Производители не найдены")).toBeVisible();
  await input.fill("quota");
  await expect(page.getByRole("alert")).toContainText("лимит");
  await page.getByRole("button", { name: "Повторить" }).click();
  await page.getByRole("button", { name: "MEYLE" }).click();
  await expect(page.getByText("Предложений и аналогов пока нет")).toBeVisible();
  await input.fill("network");
  await expect(page.getByRole("alert")).toContainText("Проверьте сеть");
});
test("mobile layout contains horizontal scrolling inside the table", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/parts?**", (route) =>
    route.fulfill({ json: { goods: [product] } }),
  );
  await page.goto("/");
  await page.getByLabel("Артикул детали").fill("01089");
  await page.getByRole("button", { name: "MEYLE" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("search button and Enter start one request without a second debounced request", async ({ page }) => {
  const calls = [];
  await page.route("**/api/parts?**", async (route) => {
    calls.push(new URL(route.request().url()).searchParams.get("number"));
    await route.fulfill({ json: { goods: [{ brand: "MEYLE" }] } });
  });
  await page.goto("/");
  await page.screenshot({ path: "test-results/search-simple.png", fullPage: true });
  const input = page.getByLabel("Артикул детали");
  await input.fill("01089");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await expect(page.getByRole("button", { name: "MEYLE" })).toBeVisible();
  await page.waitForTimeout(600);
  expect(calls).toEqual(["01089"]);
  await input.fill("OC90");
  await input.press("Enter");
  await expect(page.getByRole("button", { name: "MEYLE" })).toBeVisible();
  await page.waitForTimeout(600);
  expect(calls).toEqual(["01089", "OC90"]);
});
