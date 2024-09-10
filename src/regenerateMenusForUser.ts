import { getAllProducts } from "./repository/productRepository";
import { getAllUsers } from "./repository/userRepository";
import { generateMenus, generateMenusForUser } from "./service/menu-service";

async function main() {
    const userId = process.env.USER_ID;
    const products = await getAllProducts();
    const allUsers= await getAllUsers();
    let user = allUsers.filter((user) => user.id === userId);
    if (user.length === 0 || user.length > 1) {
        console.error("2 Users with same id");
        process.exit(1);
    }
    await generateMenusForUser(user[0], products);
    console.log("New Menus created")
}
main();