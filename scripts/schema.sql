-- ============================================
-- Credit Card Benefits Tracker — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Custom enums
CREATE TYPE benefit_frequency AS ENUM ('monthly', 'quarterly', 'half-yearly', 'yearly');
CREATE TYPE benefit_type AS ENUM ('credit', 'free_night');

-- 2. dim_all_cards — static card catalog
CREATE TABLE dim_all_cards (
  card_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_name  TEXT NOT NULL,
  card_issuer TEXT,
  image_url  TEXT,
  card_points_multipliers TEXT,
  card_badge_acronym TEXT,
  card_badge_color TEXT
);

-- 3. card_benefits — benefits per card
CREATE TABLE card_benefits (
  benefit_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id             UUID NOT NULL REFERENCES dim_all_cards(card_id) ON DELETE CASCADE,
  benefit_description TEXT NOT NULL,
  benefit_category    TEXT,
  benefit_type        benefit_type NOT NULL DEFAULT 'credit',
  value               NUMERIC,
  frequency           benefit_frequency NOT NULL,
  benefit_notes       TEXT
);

-- 4. user_tracked_cards — which cards a user tracks
CREATE TABLE user_tracked_cards (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES dim_all_cards(card_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, card_id)
);

-- 5. user_used_benefits — user interactions with benefits (notes + redemptions)
CREATE TABLE user_used_benefits (
  used_benefit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  benefit_id      UUID NOT NULL REFERENCES card_benefits(benefit_id) ON DELETE CASCADE,
  card_id         UUID NOT NULL REFERENCES dim_all_cards(card_id) ON DELETE CASCADE,
  eligible_date   DATE NOT NULL,
  is_used         BOOLEAN NOT NULL DEFAULT true,
  used_at         TIMESTAMPTZ,
  expiration_date TEXT
);

-- Unique constraint: one record per user/benefit/period
CREATE UNIQUE INDEX idx_unique_user_benefit_period
  ON user_used_benefits (user_id, benefit_id, eligible_date);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE user_tracked_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_used_benefits ENABLE ROW LEVEL SECURITY;

-- Catalog tables are public reference data — no RLS needed.
-- (RLS is only applied to user-specific tables below.)

-- user_tracked_cards: users can only access their own rows
CREATE POLICY "Users can access own tracked cards" ON user_tracked_cards
  FOR ALL USING (auth.uid() = user_id);

-- user_used_benefits: users can only access their own rows
CREATE POLICY "Users can access own used benefits" ON user_used_benefits
  FOR ALL USING (auth.uid() = user_id);
