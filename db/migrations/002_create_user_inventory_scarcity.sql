-- Create user_inventory table with scarcity logic
CREATE TABLE user_inventory (
    instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES equipment_items(item_id) ON DELETE CASCADE,
    current_durability INT DEFAULT 100 CHECK (current_durability >= 0 AND current_durability <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    last_forge_timestamp TIMESTAMP,
    -- Scarcity Logic: Cooldown varies by User Staking Volume
    next_available_forge TIMESTAMP,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    equipped_slot VARCHAR(50),
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id, instance_id)
);

-- Create indexes for fast lookups
CREATE INDEX idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_user_active ON user_inventory(user_id, is_active);
CREATE INDEX idx_user_inventory_forge_ready ON user_inventory(next_available_forge) WHERE next_available_forge IS NOT NULL;
CREATE INDEX idx_user_inventory_equipped ON user_inventory(user_id, equipped_slot) WHERE equipped_slot IS NOT NULL;

-- Create user_forge_stats table for tracking forge cooldown scaling
CREATE TABLE user_forge_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    staking_balance DECIMAL(20, 8) DEFAULT 0,
    stake_level VARCHAR(50) DEFAULT 'low_stakes', -- 'high_stakes' (>=50k BDAG) or 'low_stakes' (<50k BDAG)
    total_forges_completed INT DEFAULT 0,
    total_forge_successes INT DEFAULT 0,
    total_forge_failures INT DEFAULT 0,
    success_rate FLOAT GENERATED ALWAYS AS (
        CASE 
            WHEN total_forges_completed = 0 THEN 0
            ELSE CAST(total_forge_successes AS FLOAT) / total_forges_completed 
        END
    ) STORED,
    last_forge_success_time TIMESTAMP,
    x10_cores_generated INT DEFAULT 0,
    gas_shards_balance INT DEFAULT 0,
    blueprint_fragments_balance INT DEFAULT 0,
    catalysts_owned INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create forge_history table for analytics and cooldown tracking
CREATE TABLE forge_history (
    forge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES equipment_items(item_id),
    forge_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stake_level VARCHAR(50),
    had_catalyst BOOLEAN DEFAULT FALSE,
    result VARCHAR(50), -- 'success' or 'failure'
    gas_shards_consumed INT DEFAULT 0,
    blueprint_fragments_consumed INT DEFAULT 0,
    x10_cores_gained INT DEFAULT 0,
    success_rate FLOAT,
    cooldown_duration_ms BIGINT, -- milliseconds until next forge available
    next_available_forge TIMESTAMP,
    staking_balance_at_forge DECIMAL(20, 8)
);

-- Create indexes for forge history
CREATE INDEX idx_forge_history_user ON forge_history(user_id);
CREATE INDEX idx_forge_history_user_timestamp ON forge_history(user_id, forge_timestamp DESC);
CREATE INDEX idx_forge_history_result ON forge_history(user_id, result);

-- Create marketplace_listings table for scarcity-driven economy
CREATE TABLE marketplace_listings (
    listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'catalyst_core', 'repair_kit', 'x10_core'
    quantity INT NOT NULL CHECK (quantity > 0),
    price_per_unit DECIMAL(20, 8) NOT NULL CHECK (price_per_unit >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days',
    is_active BOOLEAN DEFAULT TRUE,
    total_sold INT DEFAULT 0
);

-- Create indexes for marketplace
CREATE INDEX idx_marketplace_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_item_type ON marketplace_listings(item_type, is_active);
CREATE INDEX idx_marketplace_active_expires ON marketplace_listings(is_active, expires_at);

-- Create transactions table for economy tracking
CREATE TABLE marketplace_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES marketplace_listings(listing_id),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price_total DECIMAL(20, 8) NOT NULL,
    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'completed' -- 'pending', 'completed', 'failed'
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_buyer ON marketplace_transactions(buyer_id, transaction_timestamp DESC);
CREATE INDEX idx_transactions_seller ON marketplace_transactions(seller_id, transaction_timestamp DESC);
CREATE INDEX idx_transactions_timestamp ON marketplace_transactions(transaction_timestamp DESC);

-- Create network_broadcasts table for Broker syndicates
CREATE TABLE network_broadcasts (
    broadcast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcaster_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    boost_type VARCHAR(50) NOT NULL, -- 'forge_success', 'repair_discount', 'fee_reduction'
    boost_value FLOAT NOT NULL DEFAULT 0.10, -- e.g., 0.10 for +10%
    affected_friend_ids UUID[] DEFAULT ARRAY[]::UUID[],
    duration_ms BIGINT DEFAULT 7200000, -- 2 hours
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '2 hours',
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for network broadcasts
CREATE INDEX idx_broadcasts_broadcaster ON network_broadcasts(broadcaster_id);
CREATE INDEX idx_broadcasts_active_end ON network_broadcasts(is_active, end_time);

-- Insert initial users for testing (optional)
-- You can comment this out if you have your own user management
-- INSERT INTO users (id, username) VALUES 
-- (gen_random_uuid(), 'test_player_1'),
-- (gen_random_uuid(), 'test_player_2');

-- Create a view for user equipment loadout (equipped items only)
CREATE VIEW user_equipped_items AS
SELECT 
    ui.user_id,
    ui.equipped_slot,
    ei.set_type,
    ei.name,
    ui.current_durability,
    ei.durability_max,
    ROUND((ui.current_durability::FLOAT / ei.durability_max) * 100, 2) AS condition_percent
FROM user_inventory ui
JOIN equipment_items ei ON ui.item_id = ei.item_id
WHERE ui.equipped_slot IS NOT NULL 
  AND ui.is_active = TRUE;

-- Create a view for forge readiness (users ready to forge)
CREATE VIEW forge_ready_users AS
SELECT 
    ui.user_id,
    COUNT(*) AS ready_count,
    MIN(ui.next_available_forge) AS next_forge_available,
    EXTRACT(EPOCH FROM (MIN(ui.next_available_forge) - NOW())) AS seconds_until_ready
FROM user_inventory ui
JOIN user_forge_stats ufs ON ui.user_id = ufs.user_id
WHERE ui.next_available_forge IS NOT NULL
  AND ui.next_available_forge <= NOW()
GROUP BY ui.user_id;
