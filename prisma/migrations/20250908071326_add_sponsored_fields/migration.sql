-- AlterTable
ALTER TABLE "public"."brands" ADD COLUMN     "sponsorWeight" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sponsored" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."coupons" ADD COLUMN     "sponsorWeight" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sponsored" BOOLEAN NOT NULL DEFAULT false;
