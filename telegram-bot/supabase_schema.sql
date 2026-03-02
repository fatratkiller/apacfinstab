-- APAC FINSTAB Telegram Bot 数据库Schema
-- 在Supabase SQL Editor中执行

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    telegram_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
    daily_free_uses INT DEFAULT 3,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    subscription_end_date DATE,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用记录表
CREATE TABLE IF NOT EXISTS usage_logs (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    query_type VARCHAR(50) NOT NULL,
    query_text TEXT,
    is_paid_feature BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    stripe_payment_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 自定义监控表 (Pro功能)
CREATE TABLE IF NOT EXISTS monitors (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    keyword VARCHAR(255) NOT NULL,
    regions TEXT[] DEFAULT ARRAY['HK'],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_telegram ON usage_logs(telegram_id);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_telegram ON payments(telegram_id);
CREATE INDEX IF NOT EXISTS idx_monitors_telegram ON monitors(telegram_id);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;

-- 允许service role访问所有数据
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (true);
CREATE POLICY "Service role full access" ON usage_logs
    FOR ALL USING (true);
CREATE POLICY "Service role full access" ON payments
    FOR ALL USING (true);
CREATE POLICY "Service role full access" ON monitors
    FOR ALL USING (true);
