/*
  Warnings:

  - You are about to drop the column `items` on the `itineraries` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `pois` table. All the data in the column will be lost.
  - You are about to drop the column `opening_hours` on the `pois` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `pois` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[share_token]` on the table `itineraries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `pois` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `signal` on the `feedbacks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `slug` to the `pois` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('WALK', 'METRO', 'BUS', 'CAR', 'AUTO', 'MIXED');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');

-- CreateEnum
CREATE TYPE "IndoorOutdoor" AS ENUM ('INDOOR', 'OUTDOOR', 'MIXED');

-- CreateEnum
CREATE TYPE "FeedbackSignal" AS ENUM ('LIKE', 'DISLIKE', 'SAVE', 'REPORT', 'NOT_RELEVANT');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "MemoryScope" AS ENUM ('GLOBAL', 'CHAT');

-- CreateEnum
CREATE TYPE "AgentName" AS ENUM ('ROUTER', 'POLICY', 'RETRIEVER', 'GEO_FILTER', 'RECOMMENDER', 'PLANNER', 'ROUTING', 'WEATHER', 'BUDGET', 'CHAT', 'ADMIN_CMS', 'SUMMARIZER', 'FEEDBACK', 'EVAL');

-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_poi_id_fkey";

-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "itineraries" DROP CONSTRAINT "itineraries_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_poi_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "reason" TEXT,
DROP COLUMN "signal",
ADD COLUMN     "signal" "FeedbackSignal" NOT NULL;

-- AlterTable
ALTER TABLE "itineraries" DROP COLUMN "items",
ADD COLUMN     "route_polyline" TEXT,
ADD COLUMN     "share_token" TEXT;

-- AlterTable
ALTER TABLE "pois" DROP COLUMN "category",
DROP COLUMN "opening_hours",
DROP COLUMN "tags",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "best_time_of_day" "TimeOfDay",
ADD COLUMN     "city" TEXT DEFAULT 'Mumbai',
ADD COLUMN     "embedding" JSONB,
ADD COLUMN     "indoor_outdoor" "IndoorOutdoor",
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "ticket_price_inr" INTEGER,
ADD COLUMN     "time_spent_min" INTEGER,
ADD COLUMN     "website_url" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "city" TEXT DEFAULT 'Mumbai',
    "home_lat" DOUBLE PRECISION,
    "home_lon" DOUBLE PRECISION,
    "budget_level" INTEGER,
    "max_walk_km" DOUBLE PRECISION,
    "preferred_modes" "TravelMode"[],
    "dietary_prefs" TEXT[],
    "interests" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poi_sources" (
    "id" TEXT NOT NULL,
    "poi_id" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "source_id" TEXT,
    "raw" JSONB,

    CONSTRAINT "poi_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poi_categories" (
    "poi_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "poi_categories_pkey" PRIMARY KEY ("poi_id","category_id")
);

-- CreateTable
CREATE TABLE "poi_tags" (
    "poi_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "poi_tags_pkey" PRIMARY KEY ("poi_id","tag_id")
);

-- CreateTable
CREATE TABLE "opening_hours" (
    "poi_id" TEXT NOT NULL,
    "day" "Weekday" NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("poi_id","day","open_time","close_time")
);

-- CreateTable
CREATE TABLE "itinerary_items" (
    "id" TEXT NOT NULL,
    "itinerary_id" TEXT NOT NULL,
    "poi_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "leg_distance_km" DOUBLE PRECISION,
    "leg_time_min" INTEGER,
    "note" TEXT,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "role" TEXT,
    "agent" "AgentName",
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL,
    "session_id" TEXT,
    "agent" "AgentName" NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "tool_usage" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_run_evidence" (
    "run_id" TEXT NOT NULL,
    "poi_id" TEXT NOT NULL,

    CONSTRAINT "agent_run_evidence_pkey" PRIMARY KEY ("run_id","poi_id")
);

-- CreateTable
CREATE TABLE "agent_memories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "scope" "MemoryScope" NOT NULL,
    "agent" "AgentName",
    "summary" TEXT NOT NULL,
    "json_payload" JSONB,
    "last_refreshed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "agent_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_cache" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "poi_id" TEXT,
    "url" TEXT,
    "storage_path" TEXT NOT NULL,
    "content_type" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "poi_sources_poi_id_key" ON "poi_sources"("poi_id");

-- CreateIndex
CREATE INDEX "itinerary_items_itinerary_id_idx" ON "itinerary_items"("itinerary_id");

-- CreateIndex
CREATE INDEX "itinerary_items_poi_id_idx" ON "itinerary_items"("poi_id");

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages"("session_id");

-- CreateIndex
CREATE INDEX "agent_runs_session_id_idx" ON "agent_runs"("session_id");

-- CreateIndex
CREATE INDEX "agent_memories_user_id_idx" ON "agent_memories"("user_id");

-- CreateIndex
CREATE INDEX "agent_memories_session_id_idx" ON "agent_memories"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "weather_cache_lat_lon_ts_provider_key" ON "weather_cache"("lat", "lon", "ts", "provider");

-- CreateIndex
CREATE INDEX "media_poi_id_idx" ON "media"("poi_id");

-- CreateIndex
CREATE INDEX "media_user_id_idx" ON "media"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "itineraries_share_token_key" ON "itineraries"("share_token");

-- CreateIndex
CREATE UNIQUE INDEX "pois_slug_key" ON "pois"("slug");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_sources" ADD CONSTRAINT "poi_sources_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_categories" ADD CONSTRAINT "poi_categories_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_categories" ADD CONSTRAINT "poi_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_tags" ADD CONSTRAINT "poi_tags_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_tags" ADD CONSTRAINT "poi_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_run_evidence" ADD CONSTRAINT "agent_run_evidence_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_run_evidence" ADD CONSTRAINT "agent_run_evidence_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_memories" ADD CONSTRAINT "agent_memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_memories" ADD CONSTRAINT "agent_memories_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE SET NULL ON UPDATE CASCADE;
