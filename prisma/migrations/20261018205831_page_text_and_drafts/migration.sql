-- CreateTable
CREATE TABLE "PageText" (
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageText_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PageDraft" (
    "page" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageDraft_pkey" PRIMARY KEY ("page")
);
