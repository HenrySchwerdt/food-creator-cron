export type Product = {
    [key: string]: string | Date | null | number;
    id: number;
    img: string | null;
    name: string | null;
    description: string | null;
    price: string | null;
    originalPrice: string | null;
    discount: string | null;
    packaging: string | null;
    availability: string | null;
    dataOrigin: string | null;
  };
  
  export type Ingredient = {
    [key: string]: string | null;
    name: string;
    quantity: string;
    unit: string;
  };
  
  export type Menu = {
    [key: string]: string | string[] | null | Ingredient[];
    name: string;
    ingredients: Ingredient[];
    steps: string[];
  };
  
  export type MenuDay = {
    [key: string]: Menu | null;
    lunch: Menu;
    dinner: Menu;
  };
  
  export type ShoppingListItem = {
    [key: string]: number | string | null;
    name: string;
    price: number;
    quantity: string;
    origin: string;
  };
  
  export type ShoppingList = {
    [key: string]: number | ShoppingListItem[] | null;
    total: number;
    items: ShoppingListItem[];
  };
  
  export type WeekMenu = {
    [key: string]: MenuDay | ShoppingList | null | number | string;
    id: number;
    userId: string;
    mon: MenuDay;
    tue: MenuDay;
    wen: MenuDay;
    thu: MenuDay;
    fri: MenuDay;
    sat: MenuDay;
    sun: MenuDay;
    list: ShoppingList;
  };
  
  export type User = {
    [key: string]: string | number | null | string[] | boolean;
    id: string;
    budget: number | null;
    favoriteMeals: string[] | null;
    kitchenEquipment: string[] | null;
    dietaryPreferences: string[] | null;
    allergies: string[] | null;
    unlikeIngredients: string[] | null;
    includeDiscounts: boolean | null;
    likedIngredients: string[] | null;
    people: number | null;
  };
  