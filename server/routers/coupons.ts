import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCoupon, deleteCoupon, getCouponByCode, listCoupons, updateCoupon } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const validateInput = z.object({
  code: z.string().min(2),
  subtotal: z.number().nonnegative(),
});

export const couponsRouter = router({
  list: adminProcedure.query(async () => {
    const rows = await listCoupons();
    return rows.map(row => ({
      ...row,
      discountValue: Number(row.discountValue ?? 0),
      minOrderValue: row.minOrderValue ? Number(row.minOrderValue) : null,
      usedCount: row.usedCount ?? 0,
      maxUses: row.maxUses ?? null,
      validFrom: row.validFrom ? row.validFrom.toISOString() : null,
      validUntil: row.validUntil ? row.validUntil.toISOString() : null,
    }));
  }),

  create: adminProcedure
    .input(
      z.object({
        code: z.string().min(2).max(50),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().nonnegative(),
        minOrderValue: z.number().nonnegative().optional(),
        maxUses: z.number().int().positive().optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await getCouponByCode(input.code);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Cupom ja existe" });
      }

      await createCoupon({
        code: input.code.trim().toUpperCase(),
        description: input.description ?? null,
        discountType: input.discountType,
        discountValue: input.discountValue.toString(),
        minOrderValue: input.minOrderValue !== undefined ? input.minOrderValue.toString() : null,
        maxUses: input.maxUses ?? null,
        validFrom: input.validFrom ? new Date(input.validFrom) : null,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        isActive: input.isActive ?? true,
      });

      return { success: true } as const;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        code: z.string().min(2).max(50).optional(),
        description: z.string().optional().nullable(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().nonnegative().optional(),
        minOrderValue: z.number().nonnegative().optional().nullable(),
        maxUses: z.number().int().positive().optional().nullable(),
        validFrom: z.string().optional().nullable(),
        validUntil: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: Record<string, unknown> = {};
      if (input.code !== undefined) updates.code = input.code.trim().toUpperCase();
      if (input.description !== undefined) updates.description = input.description ?? null;
      if (input.discountType !== undefined) updates.discountType = input.discountType;
      if (input.discountValue !== undefined) updates.discountValue = input.discountValue.toString();
      if (input.minOrderValue !== undefined) {
        updates.minOrderValue = input.minOrderValue === null ? null : input.minOrderValue.toString();
      }
      if (input.maxUses !== undefined) updates.maxUses = input.maxUses ?? null;
      if (input.validFrom !== undefined) updates.validFrom = input.validFrom ? new Date(input.validFrom) : null;
      if (input.validUntil !== undefined) updates.validUntil = input.validUntil ? new Date(input.validUntil) : null;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await updateCoupon(input.id, updates);
      return { success: true } as const;
    }),

  remove: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await deleteCoupon(input.id);
      return { success: true } as const;
    }),

  validate: publicProcedure.input(validateInput).mutation(async ({ input }) => {
    const code = input.code.trim().toUpperCase();
    const coupon = await getCouponByCode(code);

    if (!coupon) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Cupom invalido ou expirado" });
    }

    if (!coupon.isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Cupom inativo" });
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Cupom ainda nao esta valido" });
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Cupom expirado" });
    }

    const minOrderValue = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
    if (minOrderValue > 0 && input.subtotal < minOrderValue) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Valor minimo nao atingido" });
    }

    const maxUses = coupon.maxUses ?? null;
    if (maxUses !== null && coupon.usedCount !== null && coupon.usedCount >= maxUses) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Cupom esgotado" });
    }

    const discountValue = Number(coupon.discountValue ?? 0);
    const isPercentage = coupon.discountType === "percentage";
    const discountAmount = isPercentage
      ? Math.max(0, (input.subtotal * discountValue) / 100)
      : Math.max(0, discountValue);

    return {
      code,
      discountType: coupon.discountType,
      discountValue,
      discountAmount,
      description: coupon.description ?? null,
    };
  }),
});
