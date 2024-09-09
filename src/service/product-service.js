import puppeteer from "puppeteer";
import { removeAllProducts, insertProduct, batchInsertProducts } from "../repository/productRepository";

const urls = [
  "https://www.aldi-sued.de/de/angebote/frischekracher.html",
  "https://www.aldi-sued.de/de/angebote/preisaktion.html",
  "https://www.lidl.de/c/billiger-montag/a10006065?channel=store&tabCode=Current_Sales_Week",
];


export async function getProducts() {
  const allProducts = [];

  for (let url of urls) {
    let extractor = extractProductAldiData;
    if (url.includes("lidl")) {
      extractor = extractProductLidlData;
    }
    const products = await getItemsFromAldi(url, extractor);
    allProducts.push(...products);
  }
  console.log("Remove all products");
  await removeAllProducts();
  console.log("Insert all products")
  await batchInsertProducts(allProducts);
 
  return allProducts;
}



async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function getItemsFromAldi(url, extractor) {
  // Launch Puppeteer with headless mode enabled
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Load the page
  await page.goto(url, { waitUntil: "networkidle2" });
  await autoScroll(page);
  // Wait for the product items to be loaded (adjust the selector if necessary)
  if (url.includes("aldi")) {
    await page.waitForSelector(".item");
  } else if (url.includes("lidl")) {
    await page.waitForSelector(".ods-tile");
  }

  // Scrape the required data
  const products = await page.evaluate(extractor);
  const filteredProducts = products.filter((product) => product.price !== null);

  // Close the browser
  await browser.close();

  return filteredProducts;
}

function extractProductAldiData() {
  const productElements = document.querySelectorAll(".item");
  let productsData = [];

  productElements.forEach((product) => {
    const imgUrl = product.querySelector("img").getAttribute("data-src");
    const discount =
      product.querySelector("figcaption p b")?.innerText.trim() || null;
    const priceElement = product.querySelector(
      'figcaption p[style*="font-size: 25.0px;"]',
    );
    const price = priceElement?.childNodes[0]?.textContent.trim() || null;
    const originalPrice =
      priceElement?.querySelector("s")?.textContent.trim() || null;
    const productName = product.querySelector("h3")?.innerText.trim() || null;
    const additionalInfo =
      product
        .querySelector('figcaption p[style*="font-size: 11.0px;"]')
        ?.innerText.trim() || null;

    const formattedData = {
      name: productName,
      price: price,
      originalPrice: originalPrice ? `${originalPrice}` : null,
      discount: discount ? `${discount}` : null,
      description: additionalInfo,
      img: imgUrl,
      dataOrigin: "ALDI",
    };

    productsData.push(formattedData);
  });

  return productsData;
}

function extractProductLidlData() {
  const productElements = document.querySelectorAll(".ods-tile");
  let productsData = [];
  console.log(productElements.length);
  productElements.forEach((productElement) => {
    const productData = {};

    // Extract Image URL
    const imageElement = productElement.querySelector(
      ".ods-image-gallery__image",
    );
    productData.img = imageElement ? imageElement.src : null;

    // Extract Product Name
    const productNameElement = productElement.querySelector(
      ".product-grid-box__title",
    );
    productData.name = productNameElement
      ? productNameElement.innerText.trim()
      : null;

    // Extract Product Description
    const productDescElement = productElement.querySelector(
      ".product-grid-box__desc",
    );
    productData.description = productDescElement
      ? productDescElement.innerText.trim()
      : null;

    // Extract Discount (if any)
    const discountElement = productElement.querySelector(".m-price__label");
    productData.discount = discountElement
      ? discountElement.innerText.trim()
      : null;

    // Extract Original Price
    const originalPriceElement = productElement.querySelector(
      ".strikethrough.m-price__rrp",
    );
    productData.originalPrice = originalPriceElement
      ? originalPriceElement.innerText.trim()
      : null;

    // Extract Current Price
    const currentPriceElement = productElement.querySelector(".m-price__price");
    productData.price = currentPriceElement
      ? currentPriceElement.innerText.trim()
      : null;

    // Extract Packaging Information
    const packagingElement = productElement.querySelector(".price-footer");
    productData.packaging = packagingElement
      ? packagingElement.innerText.trim().replace(/[\n\r]+/g, " ")
      : null;

    // Extract Availability Information
    const availabilityElement =
      productElement.querySelector(".ods-badge__label");
    productData.availability = availabilityElement
      ? availabilityElement.innerText.trim()
      : null;
    productData.dataOrigin = "LIDL";
    productsData.push(productData);
  });

  return productsData;
}


