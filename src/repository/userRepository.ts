import { db } from "../db";
import { type User } from "../domain/types";




export const getAllUsers = async (): Promise<User[]> => {
  const allUsers= await db.query.user.findMany() as User[];
  return allUsers;
};



