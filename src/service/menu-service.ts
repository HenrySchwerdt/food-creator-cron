import OpenAI from "openai";
import { z } from "zod";
import { Product, User, WeekMenu } from "../domain/types";
import { getAllUsers } from "../repository/userRepository";
import { zodResponseFormat } from "openai/helpers/zod";
import { insertMenu, removeAllWeekMenus, removeWeekMenuForUser } from "../repository/menuRepository";

const Ingredient = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
});

const ListItem = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.string(),
  origin: z.string(),
});

const Menu = z.object({
  mon: z.object({
    lunch: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
    dinner: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
  }),
  tue: z.object({
    lunch: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
    dinner: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
  }),
  wen: z.object({
    lunch: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
    dinner: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
  }),
  thu: z.object({
    lunch: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
    dinner: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
  }),
  fri: z.object({
    lunch: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
    dinner: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
  }),
  sat: z.object({
    lunch: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
    dinner: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
  }),
  sun: z.object({
    lunch: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
    dinner: z.object({
      name: z.string(),
      ingredients: z.array(Ingredient),
      steps: z.array(z.string()),
      caloriesPerPersion: z.number(),
    }),
  }),
  list: z.object({
    total: z.number(),
    items: z.array(ListItem),
  }),
});

const promptBeginning = `Erstelle ein Menü für eine Woche. Das Menü muss für jeden Tag der Woche ein Mittagessen und ein Abendessen enthalten. 
Die Zutaten sollten frisch und gesund sein. Die Gerichte sollten einfach zuzubereiten sein und nicht zu lange dauern. Wichtig ist, dass jedes Gericht ein 
richtiges gericht ist und die Anleitung zum Zubereiten ausführlich ist. Außerdem müssen die Zutaten die für das Gericht gebraucht werden alle aufgelistet sein.`;

function createPrompt(user: User): string {
  let prompt = promptBeginning;
  if (user.budget) {
    prompt += `Das Menü sollte auch zu dem spezifizierten Budget passen. Dein Budget beträgt ${user.budget}€. Wenn du für Produkte keinen Preis hast, dann schätze einen der realistisch in einem deutschen Dsicounter dafür eingsetzt werden würde.`;
  }
  if (user.favoriteMeals) {
    prompt += `Gerne werden folgende Gerichte gemocht: ${user.favoriteMeals.join(", ")}. Versuche ähnliche Gerichte einzubauen, die dem Nutzer auch schmecken könnten.`;
  }
  if (user.likedIngredients) {
    prompt += `Folgende Zutaten werden gerne gegessen: ${user.likedIngredients.join(", ")}. Suche nach Gerichten in denen einzelne Zutaten vorkommen oder suche Gerichte die den Geschmack treffen könnten.`;
  }
  if (user.unlikeIngredients) {
    prompt += `Folgende Zutaten werden nicht gerne gegessen: ${user.unlikeIngredients.join(", ")}. Versuche diese Zutaten zu vermeiden.`;
  }
  if (user.dietaryPreferences) {
    prompt += `Folgende Ernährungspräferenzen sollten beachtet werden: ${user.dietaryPreferences.join(", ")}. Suche nach Gerichten die diesen Präferenzen entsprechen.`;
  }
  if (user.allergies) {
    prompt += `Folgende Allergien sollten beachtet werden: ${user.allergies.join(", ")}. Suche nach Gerichten die diese Allergien nicht enthalten.`;
  }
  if (user.kitchenEquipment) {
    prompt += `Folgendes Küchenequipment ist vorhanden: ${user.kitchenEquipment.join(", ")}. Suche nach Gerichten die mit diesem Equipment zubereitet werden können.`;
  }
  if (user.people) {
    prompt += `Jedes Essen sollte für ${user.people} Personen sein, achte darauf, dass deine Angaben für die Menge an Personen ausgerichtet ist.`;
  }
  prompt += `Auf der Einkaufsliste soll jede Zutat vorkommen, die für die Zubereitung der Gerichte benötigt wird. Keine Sammelbegriffe,
   wie Sonsitges oder etwas in der Art. Alles muss drauf stehen, dass in den Rezepten verwendet wird und jede Zutat soll nur einmal drauf
   stehen, wenn sie öfter benutzt wird muss die Menge auf der List angepasst werden. Außerdem sollte bei der Portionsgröße pro Person pro Gericht darauf geachtet werden,
    dass es genug Nährstoffe enthält um die gesamten Personen satt zu machen. Achte darauf, dass auch Beilagen für die Gerichte dabei sind, welche sonst keine hätten. Sonst sind zu wenige Kohlenhydrate in den Gerichten.`;
  return prompt;
}

export const generateMenus = async (products: Product[]) => {
  const openai = new OpenAI();
  const users = await getAllUsers();
  console.log("found users: ", users.length);

  // Remove all week menus before starting
  await removeAllWeekMenus();
  console.log("All Menus removed");

  // Create menu for each user concurrently
  const menuPromises = users.map(async (user) => {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: createPrompt(user),
        },
        {
          role: "user",
          content: `Kreiere ein tolles Wochenmenu für diese Woche und achte darauf, dass der Einkaufszettel korrekt ist, damit alles auf einmal eingekauft werden kann und es keine Probleme gibt. 
                ${user.includeDiscounts ? `Hier sind noch ein paar Rabat Aktionen die bei der Produkt- und Gerichtwahl helfen ${JSON.stringify(products)}` : ""}`,
        },
      ],
      response_format: zodResponseFormat(Menu, "menu"),
    });

    const menu = response?.choices?.[0]?.message?.parsed ?? [] as unknown as WeekMenu;
    const weekMenuModel = { ...menu, userId: user.id } as unknown as WeekMenu;

    // Insert menu for this user
    await insertMenu(weekMenuModel);
  });

  // Wait for all menu creation promises to complete
  await Promise.all(menuPromises);
  console.log("All menus created and inserted.");
  process.exit(0);
};

export const generateMenusForUser = async (user: User, products: Product[]) => {
  const openai = new OpenAI();

  // Remove all week menus before starting
  await removeWeekMenuForUser(user.id);
  console.log("All Menus removed");

  // Create menu for each user concurrently
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: createPrompt(user),
      },
      {
        role: "user",
        content: `Kreiere ein tolles Wochenmenu für diese Woche und achte darauf, dass der Einkaufszettel korrekt ist, damit alles auf einmal eingekauft werden kann und es keine Probleme gibt. 
                ${user.includeDiscounts ? `Hier sind noch ein paar Rabat Aktionen die bei der Produkt- und Gerichtwahl helfen ${JSON.stringify(products)}` : ""}`,
      },
    ],
    response_format: zodResponseFormat(Menu, "menu"),
  });

  const menu = response?.choices?.[0]?.message?.parsed ?? [] as unknown as WeekMenu;
  const weekMenuModel = { ...menu, userId: user.id } as unknown as WeekMenu;

  // Insert menu for this user
  await insertMenu(weekMenuModel);

  console.log("All menus created and inserted.");
  process.exit(0);
}
