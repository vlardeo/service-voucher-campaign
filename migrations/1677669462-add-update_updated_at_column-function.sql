-- Migration: add-update_updated_at_column-function
-- Created at: 2023-03-01 15:17:42

-- ====  UP  ====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';


-- ==== DOWN ====
DROP FUNCTION update_updated_at_column;
