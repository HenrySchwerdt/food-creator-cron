import { db } from "../db";
import { type WeekMenu } from "../domain/types";
import { menu } from "../db/schema";

export const insertMenu = async (weekMenu: WeekMenu): Promise<void> => {
  await db
    .insert(menu)
    .values({
      mon: weekMenu.mon,
      tue: weekMenu.tue,
      wen: weekMenu.wen,
      thu: weekMenu.thu,
      fri: weekMenu.fri,
      sat: weekMenu.sat,
      sun: weekMenu.sun,
      list: weekMenu.list,
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
