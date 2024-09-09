import { getProducts } from "./scrape/product-service";
import { generateMenus } from "./service/menu-service";

async function main() {
    console.log("Start scraping products");
    const product = await getProducts();
    console.log("Start creating menus")
    await generateMenus(product);
    console.log("New Menus created")
}
main();

