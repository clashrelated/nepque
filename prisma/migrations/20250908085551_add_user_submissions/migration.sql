-- CreateEnum
CREATE TYPE "public"."SubmissionType" AS ENUM ('BRAND', 'COUPON');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."user_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "public"."SubmissionType" NOT NULL,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("id")
);
