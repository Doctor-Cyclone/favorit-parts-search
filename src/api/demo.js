// Separate fixture transport; real API errors never silently fall back to demo.
export async function demoRequest({ number, brand }, signal) {
  await new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(resolve, 550);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
  if (number === "NETWORK") throw new TypeError("Failed to fetch");
  if (number === "QUOTA") return { error: "Request quota exceeded!" };
  if (number === "ERROR") return { error: "Invalid key client!" };
  if (!["01089", "7160500039S", "OC90"].includes(number.toUpperCase()))
    return { goods: [{}] };
  const goods = ["MEYLE", "FEBI", "MANN-FILTER"].map((name, index) => ({
    goodsID: `demo-${index}`,
    brand: name,
    number,
    name:
      number.toUpperCase() === "OC90"
        ? "Фильтр масляный"
        : "Ролик натяжителя приводного ремня",
    price: 1,
    warehouses: [
      {
        id: "MS2",
        code: "МС2",
        price: 1240 + index * 360,
        stock: 8 + index * 3,
      },
      { id: "MS1", code: "МС1", price: 1390 + index * 360, stock: 4 },
    ],
  }));
  if (!brand) return { goods };
  const selected = goods.find((item) => item.brand === brand);
  return {
    goods: selected
      ? [
          {
            ...selected,
            analogues: goods.filter((item) => item.brand !== brand),
          },
        ]
      : [{}],
  };
}
