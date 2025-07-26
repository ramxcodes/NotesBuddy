-- CreateTable
CREATE TABLE "flashcard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "isVisited" BOOLEAN NOT NULL DEFAULT false,
    "university" "University" NOT NULL,
    "degree" "Degree" NOT NULL,
    "year" "Year" NOT NULL,
    "semester" "Semester" NOT NULL,
    "subject" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "requiredTier" "PremiumTier",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flashcard_userId_idx" ON "flashcard"("userId");

-- CreateIndex
CREATE INDEX "flashcard_university_degree_year_semester_idx" ON "flashcard"("university", "degree", "year", "semester");

-- CreateIndex
CREATE INDEX "flashcard_isPremium_requiredTier_idx" ON "flashcard"("isPremium", "requiredTier");

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
