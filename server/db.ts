import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  cartItems,
  coupons,
  InsertPaymentMethod,
  InsertUser,
  paymentMethods,
  productImages,
  products,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _sqlClient: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _sqlClient = postgres(ENV.databaseUrl, {
        max: 1,
      });
      _db = drizzle(_sqlClient);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get coupon: database not available");
    return undefined;
  }

  const normalizedCode = code.trim().toUpperCase();
  const result = await db
    .select()
    .from(coupons)
    .where(sql`upper(${coupons.code}) = ${normalizedCode}`)
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listCoupons() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list coupons: database not available");
    return [];
  }

  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function createCoupon(values: typeof coupons.$inferInsert) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(coupons).values(values);
}

export async function updateCoupon(id: number, updates: Partial<typeof coupons.$inferInsert>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(coupons).set(updates).where(eq(coupons.id, id));
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(coupons).where(eq(coupons.id, id));
}

export async function listPaymentMethods(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list payment methods: database not available");
    return [];
  }

  return db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
}

export async function createPaymentMethod(
  userId: number,
  method: Omit<InsertPaymentMethod, "id" | "userId" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .limit(1);
  const shouldBeDefault = method.isDefault || existing.length === 0;

  return db.transaction(async tx => {
    if (shouldBeDefault) {
      await tx
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.userId, userId));
    }

    await tx.insert(paymentMethods).values({
      ...method,
      userId,
      isDefault: shouldBeDefault,
    });
  });
}

export async function updatePaymentMethod(
  userId: number,
  id: number,
  updates: Partial<Pick<InsertPaymentMethod, "brand" | "cardholder" | "expMonth" | "expYear" | "isDefault">>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.transaction(async tx => {
    if (updates.isDefault) {
      await tx
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.userId, userId));
    }

    await tx
      .update(paymentMethods)
      .set({ ...updates })
      .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.id, id)));
  });
}

export async function deletePaymentMethod(userId: number, id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db
    .delete(paymentMethods)
    .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.id, id)));
}

export async function setDefaultPaymentMethod(userId: number, id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.transaction(async tx => {
    await tx
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));

    await tx
      .update(paymentMethods)
      .set({ isDefault: true })
      .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.id, id)));
  });
}

export async function listCartItems(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list cart items: database not available");
    return [];
  }

  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  const productIds = rows.map(row => row.productId);
  const imageRows = productIds.length
    ? await db
        .select({
          productId: productImages.productId,
          url: productImages.url,
          displayOrder: productImages.displayOrder,
        })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.displayOrder)
    : [];

  const imageByProduct = new Map<number, string>();
  imageRows.forEach(row => {
    if (!imageByProduct.has(row.productId)) {
      imageByProduct.set(row.productId, row.url);
    }
  });

  return rows.map(row => ({
    id: row.id,
    productId: row.productId,
    name: row.name,
    slug: row.slug,
    price: Number(row.price ?? 0),
    image: imageByProduct.get(row.productId) ?? "/images/brazil-nuts-1.jpg",
    quantity: row.quantity,
    stock: row.stock ?? 0,
  }));
}

export async function addCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [product] = await db
    .select({ id: products.id, stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error("Product not found");
  }

  const maxStock = product.stock ?? 0;
  const safeQuantity = Math.max(1, maxStock > 0 ? Math.min(quantity, maxStock) : quantity);

  const [existing] = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: safeQuantity })
      .where(eq(cartItems.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db
    .insert(cartItems)
    .values({ userId, productId, quantity: safeQuantity })
    .returning({ id: cartItems.id });

  return inserted?.id ?? 0;
}

export async function updateCartItemQuantity(userId: number, cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [row] = await db
    .select({ id: cartItems.id, stock: products.stock })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(and(eq(cartItems.userId, userId), eq(cartItems.id, cartItemId)))
    .limit(1);

  if (!row) {
    throw new Error("Cart item not found");
  }

  const maxStock = row.stock ?? 0;
  const safeQuantity = Math.max(1, maxStock > 0 ? Math.min(quantity, maxStock) : quantity);

  await db
    .update(cartItems)
    .set({ quantity: safeQuantity })
    .where(eq(cartItems.id, cartItemId));
}

export async function removeCartItem(userId: number, cartItemId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.id, cartItemId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// TODO: add feature queries here as your schema grows.
