import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addCartItem,
  clearCart,
  listCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const cartRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return listCartItems(ctx.user.id);
  }),

  add: protectedProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const quantity = input.quantity ?? 1;
      await addCartItem(ctx.user.id, input.productId, quantity);
      return { success: true } as const;
    }),

  updateQuantity: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await updateCartItemQuantity(ctx.user.id, input.id, input.quantity);
      return { success: true } as const;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await removeCartItem(ctx.user.id, input.id);
      return { success: true } as const;
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    await clearCart(ctx.user.id);
    return { success: true } as const;
  }),
});
