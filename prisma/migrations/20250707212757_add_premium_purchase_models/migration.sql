/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PremiumTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'NETBANKING', 'WALLET', 'EMI', 'PAYLATER');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'REFERRAL_BONUS');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currentPremiumTier" "PremiumTier",
ADD COLUMN     "isPremiumActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premiumExpiryDate" TIMESTAMP(3),
ADD COLUMN     "referralCode" TEXT;

-- CreateTable
CREATE TABLE "PremiumPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "tier" "PremiumTier" NOT NULL,
    "duration" INTEGER NOT NULL,
    "originalAmount" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "finalAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "razorpayFee" DECIMAL(65,30),
    "razorpayTax" DECIMAL(65,30),
    "discountCode" TEXT,
    "referralCode" TEXT,
    "referredByUserId" TEXT,
    "university" "University" NOT NULL,
    "degree" "Degree" NOT NULL,
    "year" "Year" NOT NULL,
    "semester" "Semester" NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "webhookProcessed" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseDiscount" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountCode" TEXT,
    "discountValue" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "maxDiscount" DECIMAL(65,30),
    "minOrderAmount" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "maxUsesPerUser" INTEGER DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "applicableTiers" "PremiumTier"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralProgram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "referrerDiscountType" "DiscountType" NOT NULL DEFAULT 'FIXED_AMOUNT',
    "referrerDiscountValue" DECIMAL(65,30) NOT NULL,
    "refereeDiscountType" "DiscountType" NOT NULL DEFAULT 'FIXED_AMOUNT',
    "refereeDiscountValue" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "refereeUserId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "rewardAmount" DECIMAL(65,30) NOT NULL,
    "rewardType" "DiscountType" NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PremiumPurchase_razorpayOrderId_key" ON "PremiumPurchase"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumPurchase_razorpayPaymentId_key" ON "PremiumPurchase"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "PremiumPurchase_userId_idx" ON "PremiumPurchase"("userId");

-- CreateIndex
CREATE INDEX "PremiumPurchase_razorpayOrderId_idx" ON "PremiumPurchase"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "PremiumPurchase_razorpayPaymentId_idx" ON "PremiumPurchase"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "PremiumPurchase_paymentStatus_idx" ON "PremiumPurchase"("paymentStatus");

-- CreateIndex
CREATE INDEX "PremiumPurchase_tier_isActive_idx" ON "PremiumPurchase"("tier", "isActive");

-- CreateIndex
CREATE INDEX "PremiumPurchase_referredByUserId_idx" ON "PremiumPurchase"("referredByUserId");

-- CreateIndex
CREATE INDEX "PurchaseDiscount_purchaseId_idx" ON "PurchaseDiscount"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseDiscount_discountCode_idx" ON "PurchaseDiscount"("discountCode");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCoupon_code_key" ON "DiscountCoupon"("code");

-- CreateIndex
CREATE INDEX "DiscountCoupon_code_idx" ON "DiscountCoupon"("code");

-- CreateIndex
CREATE INDEX "DiscountCoupon_isActive_idx" ON "DiscountCoupon"("isActive");

-- CreateIndex
CREATE INDEX "ReferralReward_referrerUserId_idx" ON "ReferralReward"("referrerUserId");

-- CreateIndex
CREATE INDEX "ReferralReward_refereeUserId_idx" ON "ReferralReward"("refereeUserId");

-- CreateIndex
CREATE INDEX "ReferralReward_purchaseId_idx" ON "ReferralReward"("purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "user_referralCode_key" ON "user"("referralCode");

-- AddForeignKey
ALTER TABLE "PremiumPurchase" ADD CONSTRAINT "PremiumPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumPurchase" ADD CONSTRAINT "PremiumPurchase_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDiscount" ADD CONSTRAINT "PurchaseDiscount_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PremiumPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_refereeUserId_fkey" FOREIGN KEY ("refereeUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PremiumPurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
