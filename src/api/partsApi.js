import { demoRequest } from "./demo";
export const isDemo = import.meta.env.VITE_DEMO_MODE === "true";
export function readGoods(data) {
  if (!data || typeof data !== "object")
    throw new Error("API вернул некорректный ответ.");
  if (data.error) {
    const message = String(data.error);
    throw new Error(
      message.includes("Request quota exceeded!")
        ? "Превышен лимит запросов API. Попробуйте позже."
        : `Ошибка API: ${message}`,
    );
  }
  if (!data.goods || typeof data.goods !== "object")
    throw new Error("В ответе API отсутствует список товаров.");
  return (
    Array.isArray(data.goods) ? data.goods : Object.values(data.goods)
  ).filter(
    (item) => item && typeof item.brand === "string" && item.brand.trim(),
  );
}
export function normalizeOffers(goods) {
  const seen = new Set();
  return goods
    .flatMap((product) => [
      product,
      ...(Array.isArray(product.analogues) ? product.analogues : []),
    ])
    .flatMap((product) =>
      (Array.isArray(product.warehouses) ? product.warehouses : []).map(
        (warehouse, index) => {
          const id = JSON.stringify([
            product.goodsID ?? null,
            product.brand,
            product.number,
            product.name,
            warehouse.id ?? index,
            warehouse.price,
            warehouse.stock,
          ]);
          if (seen.has(id)) return null;
          seen.add(id);
          return {
            id,
            brand: product.brand,
            number: product.number,
            name: product.name,
            warehouse: warehouse.code || warehouse.id || "Склад",
            price: warehouse.price,
            stock: warehouse.stock,
          };
        },
      ),
    )
    .filter(Boolean);
}
export async function requestParts({ number, brand }, signal) {
  try {
    let data;
    if (isDemo) data = await demoRequest({ number, brand }, signal);
    else {
      const params = new URLSearchParams({ number });
      if (brand) {
        params.set("brand", brand);
        params.set("analogues", "on");
      }
      const response = await fetch(`/api/parts?${params}`, { signal });
      if (!response.ok)
        throw new Error(
          `Сервис недоступен (HTTP ${response.status}). Попробуйте позже.`,
        );
      try {
        data = await response.json();
      } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error("API вернул некорректный JSON. Попробуйте позже.");
      }
    }
    return readGoods(data);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    if (error instanceof TypeError)
      throw new Error(
        "Не удалось подключиться к API. Проверьте сеть и доступность сервиса.",
      );
    throw error;
  }
}
