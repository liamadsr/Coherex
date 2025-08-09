-- Add missing fields to match mock data structure
ALTER TABLE data_sources 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS connection TEXT,
ADD COLUMN IF NOT EXISTS repository TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS space TEXT,
ADD COLUMN IF NOT EXISTS documents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_sync TEXT,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS sync_frequency TEXT,
ADD COLUMN IF NOT EXISTS owner TEXT;

-- Add new enum values for types that exist in mock
ALTER TYPE data_source_type ADD VALUE IF NOT EXISTS 'website';
ALTER TYPE data_source_type ADD VALUE IF NOT EXISTS 'git';
ALTER TYPE data_source_type ADD VALUE IF NOT EXISTS 'files';
ALTER TYPE data_source_type ADD VALUE IF NOT EXISTS 'confluence';
ALTER TYPE data_source_type ADD VALUE IF NOT EXISTS 'local';

-- Add new status for syncing
ALTER TYPE data_source_status ADD VALUE IF NOT EXISTS 'syncing';