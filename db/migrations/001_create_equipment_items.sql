-- Create ENUM types for equipment sets and slots
CREATE TYPE equipment_set AS ENUM ('MINT', 'VAULT', 'SIPHON', 'ARCHITECT', 'BROKER');
CREATE TYPE equipment_slot AS ENUM ('HEAD', 'BODY', 'HANDS', 'FEET', 'ACCESSORY');

-- Create equipment_items table
CREATE TABLE equipment_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_type equipment_set NOT NULL,
    slot_type equipment_slot NOT NULL,
    base_modifier_value FLOAT NOT NULL,
    durability_max INT DEFAULT 100,
    durability_current INT DEFAULT 100,
    rarity VARCHAR(50) DEFAULT 'common',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(set_type, slot_type, rarity)
);

-- Create player_equipment table (inventory tracking)
CREATE TABLE player_equipment (
    player_id UUID NOT NULL,
    item_id UUID NOT NULL,
    slot_type equipment_slot NOT NULL,
    equipped BOOLEAN DEFAULT FALSE,
    durability_current INT DEFAULT 100,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, item_id),
    FOREIGN KEY (item_id) REFERENCES equipment_items(item_id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_equipment_set_slot ON equipment_items(set_type, slot_type);
CREATE INDEX idx_player_equipment_player ON player_equipment(player_id);
CREATE INDEX idx_player_equipment_equipped ON player_equipment(player_id, equipped);

-- Initial data: Populate equipment_items with 5 sets × 5 slots
INSERT INTO equipment_items (set_type, slot_type, base_modifier_value, rarity, name, description) VALUES
-- MINT Set (+1% BDAG Cashback)
('MINT', 'HEAD', 0.01, 'uncommon', 'Mint Helm', 'Purple helm granting +1% BDAG cashback'),
('MINT', 'BODY', 0.01, 'uncommon', 'Mint Chest', 'Purple chest piece granting +1% BDAG cashback'),
('MINT', 'HANDS', 0.01, 'uncommon', 'Mint Gloves', 'Purple gloves granting +1% BDAG cashback'),
('MINT', 'FEET', 0.01, 'uncommon', 'Mint Boots', 'Purple boots granting +1% BDAG cashback'),
('MINT', 'ACCESSORY', 0.01, 'uncommon', 'Mint Ring', 'Purple ring granting +1% BDAG cashback'),

-- VAULT Set (+0.75% Staking APY)
('VAULT', 'HEAD', 0.0075, 'uncommon', 'Vault Helm', 'Cyan helm granting +0.75% Staking APY'),
('VAULT', 'BODY', 0.0075, 'uncommon', 'Vault Chest', 'Cyan chest piece granting +0.75% Staking APY'),
('VAULT', 'HANDS', 0.0075, 'uncommon', 'Vault Gloves', 'Cyan gloves granting +0.75% Staking APY'),
('VAULT', 'FEET', 0.0075, 'uncommon', 'Vault Boots', 'Cyan boots granting +0.75% Staking APY'),
('VAULT', 'ACCESSORY', 0.0075, 'uncommon', 'Vault Ring', 'Cyan ring granting +0.75% Staking APY'),

-- SIPHON Set (-15% Transaction Fees)
('SIPHON', 'HEAD', -0.15, 'uncommon', 'Siphon Helm', 'Green helm reducing transaction fees by 15%'),
('SIPHON', 'BODY', -0.15, 'uncommon', 'Siphon Chest', 'Green chest piece reducing transaction fees by 15%'),
('SIPHON', 'HANDS', -0.15, 'uncommon', 'Siphon Gloves', 'Green gloves reducing transaction fees by 15%'),
('SIPHON', 'FEET', -0.15, 'uncommon', 'Siphon Boots', 'Green boots reducing transaction fees by 15%'),
('SIPHON', 'ACCESSORY', -0.15, 'uncommon', 'Siphon Ring', 'Green ring reducing transaction fees by 15%'),

-- ARCHITECT Set (-10% Crafting Costs)
('ARCHITECT', 'HEAD', -0.10, 'uncommon', 'Architect Helm', 'Orange helm reducing crafting costs by 10%'),
('ARCHITECT', 'BODY', -0.10, 'uncommon', 'Architect Chest', 'Orange chest piece reducing crafting costs by 10%'),
('ARCHITECT', 'HANDS', -0.10, 'uncommon', 'Architect Gloves', 'Orange gloves reducing crafting costs by 10%'),
('ARCHITECT', 'FEET', -0.10, 'uncommon', 'Architect Boots', 'Orange boots reducing crafting costs by 10%'),
('ARCHITECT', 'ACCESSORY', -0.10, 'uncommon', 'Architect Ring', 'Orange ring reducing crafting costs by 10%'),

-- BROKER Set (+0.5% Network Commission)
('BROKER', 'HEAD', 0.005, 'uncommon', 'Broker Helm', 'Yellow helm granting +0.5% network commission'),
('BROKER', 'BODY', 0.005, 'uncommon', 'Broker Chest', 'Yellow chest piece granting +0.5% network commission'),
('BROKER', 'HANDS', 0.005, 'uncommon', 'Broker Gloves', 'Yellow gloves granting +0.5% network commission'),
('BROKER', 'FEET', 0.005, 'uncommon', 'Broker Boots', 'Yellow boots granting +0.5% network commission'),
('BROKER', 'ACCESSORY', 0.005, 'uncommon', 'Broker Ring', 'Yellow ring granting +0.5% network commission');
