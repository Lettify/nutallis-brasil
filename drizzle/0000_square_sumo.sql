DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
		CREATE TYPE "user_role" AS ENUM ('user', 'admin');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nutritional_objective') THEN
		CREATE TYPE "nutritional_objective" AS ENUM ('energia', 'imunidade', 'coracao', 'cerebro', 'pele', 'geral');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
		CREATE TYPE "discount_type" AS ENUM ('percentage', 'fixed');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
		CREATE TYPE "order_status" AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
		CREATE TYPE "payment_method" AS ENUM ('pix', 'credit_card', 'debit_card');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_gateway') THEN
		CREATE TYPE "payment_gateway" AS ENUM ('mercadopago', 'efi');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
		CREATE TYPE "payment_status" AS ENUM ('pending', 'processing', 'approved', 'rejected', 'refunded');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_provider') THEN
		CREATE TYPE "delivery_provider" AS ENUM ('uber_direct', 'ifood', 'correios', 'local');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'banner_position') THEN
		CREATE TYPE "banner_position" AS ENUM ('hero', 'collection', 'promo');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'setting_type') THEN
		CREATE TYPE "setting_type" AS ENUM ('string', 'number', 'boolean', 'json');
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
		CREATE TYPE "contact_status" AS ENUM ('new', 'read', 'replied', 'archived');
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"label" varchar(50),
	"recipientName" varchar(100) NOT NULL,
	"phone" varchar(20),
	"street" varchar(200) NOT NULL,
	"number" varchar(20) NOT NULL,
	"complement" varchar(100),
	"neighborhood" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zipCode" varchar(10) NOT NULL,
	"isDefault" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200),
	"subtitle" text,
	"imageUrl" text NOT NULL,
	"mobileImageUrl" text,
	"linkUrl" text,
	"buttonText" varchar(50),
	"position" "banner_position" DEFAULT 'hero',
	"displayOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"validFrom" timestamp,
	"validUntil" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cartItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"imageUrl" text,
	"displayOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contactMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"subject" varchar(200),
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'new',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discountType" "discount_type" NOT NULL,
	"discountValue" numeric(10, 2) NOT NULL,
	"minOrderValue" numeric(10, 2),
	"maxUses" integer,
	"usedCount" integer DEFAULT 0,
	"validFrom" timestamp,
	"validUntil" timestamp,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "faqItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(50),
	"displayOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"productName" varchar(200) NOT NULL,
	"productSku" varchar(50),
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"totalPrice" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderNumber" varchar(20) NOT NULL,
	"userId" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"shippingCost" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"couponId" integer,
	"couponCode" varchar(50),
	"paymentMethod" "payment_method",
	"paymentGateway" "payment_gateway",
	"paymentStatus" "payment_status" DEFAULT 'pending',
	"paymentId" varchar(100),
	"paymentDetails" jsonb,
	"shippingAddressId" integer,
	"shippingAddress" jsonb,
	"deliveryProvider" "delivery_provider",
	"deliveryId" varchar(100),
	"deliveryDetails" jsonb,
	"trackingCode" varchar(100),
	"estimatedDelivery" timestamp,
	"deliveredAt" timestamp,
	"notes" text,
	"invoiceNumber" varchar(50),
	"invoiceUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "paymentMethods" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"brand" varchar(50) NOT NULL,
	"cardholder" varchar(120) NOT NULL,
	"last4" varchar(4) NOT NULL,
	"expMonth" varchar(2) NOT NULL,
	"expYear" varchar(4) NOT NULL,
	"provider" varchar(40),
	"providerToken" varchar(255),
	"isDefault" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productImages" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"url" text NOT NULL,
	"fileKey" varchar(255),
	"alt" varchar(200),
	"isMacro" boolean DEFAULT false,
	"displayOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"shortDescription" text,
	"price" numeric(10, 2) NOT NULL,
	"compareAtPrice" numeric(10, 2),
	"costPrice" numeric(10, 2),
	"sku" varchar(50),
	"barcode" varchar(50),
	"stock" integer DEFAULT 0 NOT NULL,
	"lowStockThreshold" integer DEFAULT 5,
	"weight" numeric(8, 2),
	"categoryId" integer,
	"nutritionalObjective" "nutritional_objective",
	"nutritionalInfo" jsonb,
	"harmonization" text,
	"origin" varchar(100),
	"isActive" boolean DEFAULT true,
	"isFeatured" boolean DEFAULT false,
	"isLimitedEdition" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "storeSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"type" "setting_type" DEFAULT 'string',
	"description" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storeSettings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"customerName" varchar(100) NOT NULL,
	"customerLocation" varchar(100),
	"customerAvatar" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5,
	"isActive" boolean DEFAULT true,
	"displayOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(20),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
