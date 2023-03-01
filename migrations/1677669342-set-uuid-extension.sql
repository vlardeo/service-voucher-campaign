-- Migration: set-uuid-extension
-- Created at: 2023-03-01 15:15:42

-- ====  UP  ====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==== DOWN ====
DROP EXTENSION "uuid-ossp";
