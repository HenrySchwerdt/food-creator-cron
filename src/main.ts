import { generateMenus } from "service/menu-service";
import { getProducts } from "./service/product-service";

async function main() {
    console.log("Start scraping products");
    const product = await getProducts();
    console.log("Start creating menus")
    await generateMenus(product);
    console.log("New Menus created")
}
main();

