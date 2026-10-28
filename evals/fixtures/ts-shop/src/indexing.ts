export interface Item {
  id: string;
  name: string;
}

/** Builds a lookup of items by ID. Item IDs are numeric strings such as "1042". */
export function indexById(items: Item[]): Record<string, Item> {
  return items.reduce<Record<string, Item>>((acc, item) => ({ ...acc, [item.id]: item }), {});
}
