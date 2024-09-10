import { db } from "../db";
import { type WeekMenu } from "../domain/types";
import { menu } from "../db/schema";
import { eq } from "drizzle-orm";

export const insertMenu = async (weekMenu: WeekMenu): Promise<void> => {
  await db
    .insert(menu)
    .values({
     ...weekMenu,
    })
    .execute();
};

export const removeAllWeekMenus = async (): Promise<void> => {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(menu).execute();
};

export const getAllWeekMenus = async (): Promise<WeekMenu[]> => {
  const weekMenu = await db.query.menu.findMany();
  return weekMenu as WeekMenu[];
};

export const removeWeekMenuForUser = async (userId: string): Promise<void> => {
  await db
    .delete(menu)
    .where(eq(menu.userId, userId))
    .execute();
}
