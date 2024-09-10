import { db } from "../db";
import { type Product } from "../domain/types";
import { products } from "../db/schema";


export const batchInsertProducts = async (productList: Product[]): Promise<void> => {
  if (productList.length === 0) {
    return;
  }

  const values = productList.map((product) => ({
    img: product.img,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    packaging: product.packaging,
    availability: product.availability,
    dataOrigin: product.dataOrigin,
    discount: product.discount,
  }));

  await db
    .insert(products)
    .values(values)
    .execute();
};

export const getAllProducts = async (): Promise<Product[]> => {
  const product: Product[] = await db.query.products.findMany() as Product[];
  return product;
};


export const removeAllProducts = async (): Promise<void> => {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(products).execute();
};
