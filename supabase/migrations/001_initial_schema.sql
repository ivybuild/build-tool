-- ==========================================
-- 个人学习网站 - Supabase 数据库迁移脚本
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ==========================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 表1: notes（记录模块）
-- ==========================================
CREATE TABLE IF NOT EXISTS notes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  images      JSONB DEFAULT '[]'::jsonb,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 记录表索引
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 表2: cards（学习卡片）
-- ==========================================
CREATE TABLE IF NOT EXISTS cards (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           VARCHAR(255) NOT NULL,
  -- content 结构: { "segments": [{ "type": "text"|"blank", "content": "文字内容" }] }
  content         JSONB DEFAULT '{"segments": []}'::jsonb,
  study_count     INTEGER DEFAULT 0 NOT NULL,
  is_archived     BOOLEAN DEFAULT FALSE NOT NULL,
  -- 遗忘曲线：下次复习时间
  next_review_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_studied_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 卡片表索引
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_is_archived ON cards(is_archived);
CREATE INDEX IF NOT EXISTS idx_cards_next_review_at ON cards(next_review_at);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);

CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 表3: study_logs（学习日志）
-- ==========================================
CREATE TABLE IF NOT EXISTS study_logs (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id     UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  studied_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 学习日志索引
CREATE INDEX IF NOT EXISTS idx_study_logs_card_id ON study_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_id ON study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_studied_at ON study_logs(studied_at DESC);

-- ==========================================
-- Row Level Security (RLS) 行级安全策略
-- ==========================================

-- 启用 RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

-- notes 策略：用户只能操作自己的记录
CREATE POLICY "users_own_notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

-- cards 策略：用户只能操作自己的卡片
CREATE POLICY "users_own_cards" ON cards
  FOR ALL USING (auth.uid() = user_id);

-- study_logs 策略：用户只能操作自己的学习日志
CREATE POLICY "users_own_study_logs" ON study_logs
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Supabase Storage 存储桶配置
-- 在 Supabase Dashboard > Storage 中手动创建：
-- Bucket 名称: note-images
-- 设置为 Public bucket（公开读取）
-- ==========================================
