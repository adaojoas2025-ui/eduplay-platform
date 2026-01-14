-- AddColumns to users table for producer bank information
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bankAccount" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bankAccountType" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bankAgency" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessAddress" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessDocument" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessPhone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "producerApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "producerApprovedAt" TIMESTAMP(3);

-- AddColumn to products table for approval fields
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rejectedBy" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- AddColumn to orders table for metadata
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- AlterColumn to make productId optional in orders
ALTER TABLE "orders" ALTER COLUMN "productId" DROP NOT NULL;

-- Add ProductStatus enum values if not exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING_APPROVAL' AND enumtypid = 'ProductStatus'::regtype) THEN
        ALTER TYPE "ProductStatus" ADD VALUE 'PENDING_APPROVAL';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REJECTED' AND enumtypid = 'ProductStatus'::regtype) THEN
        ALTER TYPE "ProductStatus" ADD VALUE 'REJECTED';
    END IF;
END $$;

-- CreateEnum for Apps
DO $$ BEGIN
    CREATE TYPE "AppStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AppVersion" AS ENUM ('FREE_WITH_ADS', 'PAID_NO_ADS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for Gamification
DO $$ BEGIN
    CREATE TYPE "BadgeType" AS ENUM ('FIRST_PURCHASE', 'FIRST_SALE', 'COURSES_COMPLETED', 'REVIEWS_MADE', 'STREAK_ACHIEVEMENT', 'SALES_MILESTONE', 'ENGAGEMENT', 'SPECIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MissionType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MissionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CLAIMED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable apps
CREATE TABLE IF NOT EXISTS "apps" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "iconUrl" TEXT NOT NULL,
    "coverImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "fileSize" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ageRating" TEXT NOT NULL DEFAULT 'Livre',
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "freeWithAdsUrl" TEXT,
    "freeWithAdsActive" BOOLEAN NOT NULL DEFAULT true,
    "paidNoAdsUrl" TEXT,
    "paidNoAdsPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidNoAdsActive" BOOLEAN NOT NULL DEFAULT false,
    "adsenseEnabled" BOOLEAN NOT NULL DEFAULT false,
    "adsenseSlot" TEXT,
    "whatsNew" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiresInternet" BOOLEAN NOT NULL DEFAULT false,
    "inAppPurchases" BOOLEAN NOT NULL DEFAULT false,
    "status" "AppStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "apps_slug_key" ON "apps"("slug");
CREATE INDEX IF NOT EXISTS "apps_category_idx" ON "apps"("category");
CREATE INDEX IF NOT EXISTS "apps_featured_idx" ON "apps"("featured");
CREATE INDEX IF NOT EXISTS "apps_status_idx" ON "apps"("status");

-- CreateTable app_reviews
CREATE TABLE IF NOT EXISTS "app_reviews" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "app_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_reviews_appId_idx" ON "app_reviews"("appId");

-- CreateTable app_downloads
CREATE TABLE IF NOT EXISTS "app_downloads" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT,
    "version" "AppVersion" NOT NULL,
    "orderId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_downloads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_downloads_appId_idx" ON "app_downloads"("appId");
CREATE INDEX IF NOT EXISTS "app_downloads_userId_idx" ON "app_downloads"("userId");

-- CreateTable cart_items
CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");
CREATE INDEX IF NOT EXISTS "cart_items_userId_idx" ON "cart_items"("userId");

-- CreateTable combos
CREATE TABLE IF NOT EXISTS "combos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountPrice" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "producerId" TEXT NOT NULL,
    CONSTRAINT "combos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "combos_producerId_idx" ON "combos"("producerId");

-- CreateTable combo_products
CREATE TABLE IF NOT EXISTS "combo_products" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "combo_products_comboId_productId_key" ON "combo_products"("comboId", "productId");
CREATE INDEX IF NOT EXISTS "combo_products_comboId_idx" ON "combo_products"("comboId");

-- CreateTable badges
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "icon" TEXT NOT NULL,
    "requiredValue" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable missions
CREATE TABLE IF NOT EXISTS "missions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "MissionType" NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "pointsReward" INTEGER NOT NULL,
    "icon" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxCompletions" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable leaderboards
CREATE TABLE IF NOT EXISTS "leaderboards" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT,
    "value" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leaderboards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "leaderboards_period_category_userId_periodStart_key" ON "leaderboards"("period", "category", "userId", "periodStart");
CREATE INDEX IF NOT EXISTS "leaderboards_period_category_rank_idx" ON "leaderboards"("period", "category", "rank");

-- CreateTable user_gamification
CREATE TABLE IF NOT EXISTS "user_gamification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "levelProgress" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "coursesCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "reviewsMade" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_gamification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_gamification_userId_key" ON "user_gamification"("userId");

-- CreateTable user_badges
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");
CREATE INDEX IF NOT EXISTS "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateTable user_missions
CREATE TABLE IF NOT EXISTS "user_missions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_missions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_missions_userId_missionId_key" ON "user_missions"("userId", "missionId");
CREATE INDEX IF NOT EXISTS "user_missions_userId_idx" ON "user_missions"("userId");
CREATE INDEX IF NOT EXISTS "user_missions_status_idx" ON "user_missions"("status");

-- CreateTable points_history
CREATE TABLE IF NOT EXISTS "points_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "points_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "points_history_userId_idx" ON "points_history"("userId");
CREATE INDEX IF NOT EXISTS "points_history_createdAt_idx" ON "points_history"("createdAt");

-- AddForeignKey for app_reviews
ALTER TABLE "app_reviews" DROP CONSTRAINT IF EXISTS "app_reviews_appId_fkey";
ALTER TABLE "app_reviews" ADD CONSTRAINT "app_reviews_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for app_downloads
ALTER TABLE "app_downloads" DROP CONSTRAINT IF EXISTS "app_downloads_appId_fkey";
ALTER TABLE "app_downloads" ADD CONSTRAINT "app_downloads_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for cart_items
ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_productId_fkey";
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_userId_fkey";
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for combos
ALTER TABLE "combos" DROP CONSTRAINT IF EXISTS "combos_producerId_fkey";
ALTER TABLE "combos" ADD CONSTRAINT "combos_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for combo_products
ALTER TABLE "combo_products" DROP CONSTRAINT IF EXISTS "combo_products_comboId_fkey";
ALTER TABLE "combo_products" ADD CONSTRAINT "combo_products_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "combos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for user_gamification
ALTER TABLE "user_gamification" DROP CONSTRAINT IF EXISTS "user_gamification_userId_fkey";
ALTER TABLE "user_gamification" ADD CONSTRAINT "user_gamification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for user_badges
ALTER TABLE "user_badges" DROP CONSTRAINT IF EXISTS "user_badges_badgeId_fkey";
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges" DROP CONSTRAINT IF EXISTS "user_badges_userId_fkey";
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_gamification"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for user_missions
ALTER TABLE "user_missions" DROP CONSTRAINT IF EXISTS "user_missions_missionId_fkey";
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_missions" DROP CONSTRAINT IF EXISTS "user_missions_userId_fkey";
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_gamification"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for points_history
ALTER TABLE "points_history" DROP CONSTRAINT IF EXISTS "points_history_userId_fkey";
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_gamification"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
