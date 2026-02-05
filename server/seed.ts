import "dotenv/config";
import { inArray } from "drizzle-orm";
import { getDb } from "./db";
import { categories, productImages, products } from "../drizzle/schema";

type CategorySeed = typeof categories.$inferInsert;

type ProductSeed = Omit<typeof products.$inferInsert, "categoryId"> & {
  categorySlug: string;
};

type ProductImageSeed = {
  productSlug: string;
  url: string;
  alt?: string | null;
  displayOrder?: number;
};

const categorySeed: CategorySeed[] = [
  {
    name: "Castanhas",
    slug: "castanhas",
    description: "Selecao premium de castanhas brasileiras",
    imageUrl: "/images/brazil-nuts-2.jpg",
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Mix Gourmet",
    slug: "mix",
    description: "Combos autorais para rituais de bem-estar",
    imageUrl: "/images/mixed-nuts-2.jpg",
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "Edicoes Limitadas",
    slug: "limitadas",
    description: "Curadoria sazonal em tiragens reduzidas",
    imageUrl: "/images/nuts-tray.jpg",
    displayOrder: 3,
    isActive: true,
  },
];

const productSeed: ProductSeed[] = [
  {
    name: "Castanha do Para Premium",
    slug: "castanha-do-para-premium",
    shortDescription: "Castanhas selecionadas da Amazonia brasileira",
    price: "89.90",
    compareAtPrice: "109.90",
    stock: 50,
    nutritionalObjective: "imunidade",
    isActive: true,
    isFeatured: true,
    isLimitedEdition: false,
    categorySlug: "castanhas",
  },
  {
    name: "Mix Gourmet Tropical",
    slug: "mix-gourmet-tropical",
    shortDescription: "Castanhas e frutas secas em equilibrio perfeito",
    price: "79.90",
    stock: 35,
    nutritionalObjective: "energia",
    isActive: true,
    isFeatured: true,
    isLimitedEdition: false,
    categorySlug: "mix",
  },
  {
    name: "Castanha de Caju Torrada",
    slug: "castanha-de-caju-torrada",
    shortDescription: "Caju premium levemente torrado",
    price: "69.90",
    stock: 42,
    nutritionalObjective: "coracao",
    isActive: true,
    isFeatured: false,
    isLimitedEdition: false,
    categorySlug: "castanhas",
  },
  {
    name: "Mix Energia Plus",
    slug: "mix-energia-plus",
    shortDescription: "Selecao para alto desempenho",
    price: "94.90",
    compareAtPrice: "119.90",
    stock: 28,
    nutritionalObjective: "energia",
    isActive: true,
    isFeatured: true,
    isLimitedEdition: false,
    categorySlug: "mix",
  },
  {
    name: "Amendoas Californianas",
    slug: "amendoas-californianas",
    shortDescription: "Amendoas importadas de alta qualidade",
    price: "74.90",
    stock: 60,
    nutritionalObjective: "cerebro",
    isActive: true,
    isFeatured: false,
    isLimitedEdition: false,
    categorySlug: "castanhas",
  },
  {
    name: "Edicao Limitada Natal",
    slug: "edicao-limitada-natal",
    shortDescription: "Selecao especial para o fim de ano",
    price: "149.90",
    stock: 15,
    nutritionalObjective: "geral",
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    categorySlug: "limitadas",
  },
  {
    name: "Mix Botanico Relax",
    slug: "mix-botanico-relax",
    shortDescription: "Blend suave para noites calmas",
    price: "82.90",
    stock: 22,
    nutritionalObjective: "pele",
    isActive: true,
    isFeatured: false,
    isLimitedEdition: false,
    categorySlug: "mix",
  },
  {
    name: "Castanha do Brasil Organica",
    slug: "castanha-brasil-organica",
    shortDescription: "Origem certificada e textura amanteigada",
    price: "96.00",
    stock: 18,
    nutritionalObjective: "imunidade",
    isActive: true,
    isFeatured: false,
    isLimitedEdition: false,
    categorySlug: "castanhas",
  },
];

const productImageSeed: ProductImageSeed[] = [
  {
    productSlug: "castanha-do-para-premium",
    url: "/images/brazil-nuts-1.jpg",
    alt: "Castanha do para premium",
    displayOrder: 1,
  },
  {
    productSlug: "mix-gourmet-tropical",
    url: "/images/mixed-nuts-1.jpg",
    alt: "Mix gourmet tropical",
    displayOrder: 1,
  },
  {
    productSlug: "castanha-de-caju-torrada",
    url: "/images/mixed-nuts-2.jpg",
    alt: "Castanha de caju torrada",
    displayOrder: 1,
  },
  {
    productSlug: "mix-energia-plus",
    url: "/images/nuts-tray.jpg",
    alt: "Mix energia plus",
    displayOrder: 1,
  },
  {
    productSlug: "amendoas-californianas",
    url: "/images/brazil-nuts-2.jpg",
    alt: "Amendoas californianas",
    displayOrder: 1,
  },
  {
    productSlug: "edicao-limitada-natal",
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028671915/DmqzkafUOnmssCjn.png",
    alt: "Edicao limitada natal",
    displayOrder: 1,
  },
  {
    productSlug: "mix-botanico-relax",
    url: "/images/mixed-nuts-2.jpg",
    alt: "Mix botanico relax",
    displayOrder: 1,
  },
  {
    productSlug: "castanha-brasil-organica",
    url: "/images/brazil-nuts-1.jpg",
    alt: "Castanha do Brasil organica",
    displayOrder: 1,
  },
];

async function seed() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available. Check DATABASE_URL.");
  }

  await db.insert(categories).values(categorySeed).onConflictDoNothing();

  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(inArray(categories.slug, categorySeed.map((category) => category.slug)));

  const categoryIdBySlug = new Map(
    categoryRows.map((row) => [row.slug, row.id])
  );

  const productValues = productSeed.map((product) => ({
    ...product,
    categoryId: categoryIdBySlug.get(product.categorySlug) ?? null,
  }));

  await db.insert(products).values(productValues).onConflictDoNothing();

  const productRows = await db
    .select({ id: products.id, slug: products.slug })
    .from(products)
    .where(inArray(products.slug, productSeed.map((product) => product.slug)));

  const productIdBySlug = new Map(
    productRows.map((row) => [row.slug, row.id])
  );

  const productIds = productRows.map((row) => row.id);
  if (productIds.length > 0) {
    await db.delete(productImages).where(inArray(productImages.productId, productIds));
  }

  const imageValues = productImageSeed
    .map((image) => {
      const productId = productIdBySlug.get(image.productSlug);
      if (!productId) return null;
      return {
        productId,
        url: image.url,
        alt: image.alt ?? null,
        displayOrder: image.displayOrder ?? 0,
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  if (imageValues.length > 0) {
    await db.insert(productImages).values(imageValues);
  }

  console.log("Seed complete:", {
    categories: categoryRows.length,
    products: productRows.length,
    images: imageValues.length,
  });
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
