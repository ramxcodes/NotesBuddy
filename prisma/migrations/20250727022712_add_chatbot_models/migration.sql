/*
  Warnings:

  - You are about to drop the column `prompt` on the `chat_message` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `chat_message` table. All the data in the column will be lost.
  - Added the required column `content` to the `chat_message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chat_message" DROP COLUMN "prompt",
DROP COLUMN "response",
ADD COLUMN     "content" TEXT NOT NULL,
ALTER COLUMN "model" DROP NOT NULL;
