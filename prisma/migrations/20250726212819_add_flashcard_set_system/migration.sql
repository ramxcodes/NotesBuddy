/*
  Warnings:

  - You are about to drop the `flashcard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "flashcard" DROP CONSTRAINT "flashcard_userId_fkey";

-- DropTable
DROP TABLE "flashcard";

-- CreateTable
CREATE TABLE "flashcard_set" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "university" "University" NOT NULL,
    "degree" "Degree" NOT NULL,
    "year" "Year" NOT NULL,
    "semester" "Semester" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "requiredTier" "PremiumTier",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_item" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_visit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "cardId" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flashcard_set_university_degree_year_semester_idx" ON "flashcard_set"("university", "degree", "year", "semester");

-- CreateIndex
CREATE INDEX "flashcard_set_subject_idx" ON "flashcard_set"("subject");

-- CreateIndex
CREATE INDEX "flashcard_set_isActive_isPublished_idx" ON "flashcard_set"("isActive", "isPublished");

-- CreateIndex
CREATE INDEX "flashcard_set_isPremium_requiredTier_idx" ON "flashcard_set"("isPremium", "requiredTier");

-- CreateIndex
CREATE INDEX "flashcard_item_setId_order_idx" ON "flashcard_item"("setId", "order");

-- CreateIndex
CREATE INDEX "flashcard_visit_userId_setId_idx" ON "flashcard_visit"("userId", "setId");

-- CreateIndex
CREATE INDEX "flashcard_visit_userId_visitedAt_idx" ON "flashcard_visit"("userId", "visitedAt");

-- AddForeignKey
ALTER TABLE "flashcard_item" ADD CONSTRAINT "flashcard_item_setId_fkey" FOREIGN KEY ("setId") REFERENCES "flashcard_set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_visit" ADD CONSTRAINT "flashcard_visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_visit" ADD CONSTRAINT "flashcard_visit_setId_fkey" FOREIGN KEY ("setId") REFERENCES "flashcard_set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_visit" ADD CONSTRAINT "flashcard_visit_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "flashcard_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
