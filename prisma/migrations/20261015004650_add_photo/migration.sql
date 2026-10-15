-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "placement" TEXT,
    "serviceSlug" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_placement_key" ON "Photo"("placement");

-- CreateIndex
CREATE INDEX "Photo_visible_createdAt_idx" ON "Photo"("visible", "createdAt");

-- CreateIndex
CREATE INDEX "Photo_serviceSlug_idx" ON "Photo"("serviceSlug");
