// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
    boolean,
    integer,
    json,
    pgTableCreator,
    real,
    serial,
    uuid,
    varchar,
  } from "drizzle-orm/pg-core";
  import { type MenuDay, type ShoppingList } from "../domain/types";
  
  /**
   * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
   * database instance for multiple projects.
   *
   * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
   */
  export const createTable = pgTableCreator((name) => `food-creator_${name}`);
  
  export const products = createTable("products", {
    id: serial("id").primaryKey(),
    img: varchar("img", { length: 512 }),
    name: varchar("name", { length: 256 }),
    description: varchar("description", { length: 512 }),
    price: varchar("price", { length: 256 }),
    originalPrice: varchar("original_price", { length: 256 }),
    discount: varchar("discount", { length: 256 }),
    packaging: varchar("packaging", { length: 256 }),
    availability: varchar("availability", { length: 256 }),
    dataOrigin: varchar("data_origin", { length: 256 }),
  });
  
  export const menu = createTable("menu", {
    id: serial("id").primaryKey(),
    userId: varchar("userId", { length: 256 }),
    mon: json("mon").$type<MenuDay>().notNull(),
    tue: json("tue").$type<MenuDay>().notNull(),
    wen: json("wen").$type<MenuDay>().notNull(),
    thu: json("thu").$type<MenuDay>().notNull(),
    fri: json("fri").$type<MenuDay>().notNull(),
    sat: json("sat").$type<MenuDay>().notNull(),
    sun: json("sun").$type<MenuDay>().notNull(),
    list: json("list").$type<ShoppingList>().notNull(),
  });
  
  export const user = createTable("user", {
    id: varchar("id", { length: 256 }).primaryKey(),
    budget: real("budget"),
    favoriteMeals: json("favorite_meals").$type<string[]>(),
    kitchenEquipment: json("kitchen_equipment").$type<string[]>(),
    dietaryPreferences: json("dietary_preferences").$type<string[]>(),
    allergies: json("allergies").$type<string[]>(),
    unlikeIngredients: json("unlike_ingredients").$type<string[]>(),
    likedIngredients: json("liked_ingredients").$type<string[]>(),
    includeDiscounts: boolean("include_discounts"),
    people: integer("people"),
  });
  