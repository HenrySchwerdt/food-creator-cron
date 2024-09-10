import { getAllProducts } from "./repository/productRepository";
import { generateMenus } from "./service/menu-service";

async function main() {
    const products = await getAllProducts();
    console.log("Start creating menus")
    await generateMenus(products);
    console.log("New Menus created")
}
main();