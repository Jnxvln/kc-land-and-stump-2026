/*
  Warnings:

  - You are about to drop the column `placement` on the `Photo` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "PhotoPlacement" (
    "spot" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,

    CONSTRAINT "PhotoPlacement_pkey" PRIMARY KEY ("spot")
);

-- CreateIndex
CREATE INDEX "PhotoPlacement_photoId_idx" ON "PhotoPlacement"("photoId");

-- AddForeignKey
ALTER TABLE "PhotoPlacement" ADD CONSTRAINT "PhotoPlacement_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy existing featured assignments into the new table before the old column goes away.
INSERT INTO "PhotoPlacement" ("spot", "photoId")
SELECT "placement", "id" FROM "Photo" WHERE "placement" IS NOT NULL;

-- DropIndex
DROP INDEX "Photo_placement_key";

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "placement";