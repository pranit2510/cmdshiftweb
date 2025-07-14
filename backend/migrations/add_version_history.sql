-- Migration: Add version history support for projects
-- This migration creates a project_versions table to track all versions of a project
-- allowing users to see and restore previous versions of their generated code

-- Create the project_versions table
CREATE TABLE IF NOT EXISTS project_versions (
    -- Primary key using UUID for distributed systems compatibility
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key to the projects table
    -- When a project is deleted, all its versions are also deleted
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Version number for this snapshot (1, 2, 3, etc.)
    -- Automatically increments for each project
    version_number INTEGER NOT NULL,
    
    -- Complete snapshot of the code at this version
    -- Stores either the single file code or the multi-file JSON structure
    code_snapshot JSONB NOT NULL,
    
    -- The prompt/message that was used to generate or edit this version
    -- Helps users understand what changes were made
    prompt_used TEXT NOT NULL,
    
    -- Timestamp when this version was created
    -- Defaults to current time, with timezone support
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure version numbers are unique per project
    CONSTRAINT unique_project_version UNIQUE (project_id, version_number)
);

-- Create indexes for performance optimization

-- Index on project_id for fast lookup of all versions for a project
-- Used when displaying version history for a specific project
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);

-- Index on created_at for chronological sorting
-- Used when displaying versions in order
CREATE INDEX idx_project_versions_created_at ON project_versions(created_at DESC);

-- Composite index for the most common query pattern:
-- "Get all versions for a project ordered by version number"
CREATE INDEX idx_project_versions_project_version ON project_versions(project_id, version_number DESC);

-- Add comments to document the table and columns
COMMENT ON TABLE project_versions IS 'Stores version history for projects, tracking all changes made through generation and editing';
COMMENT ON COLUMN project_versions.id IS 'Unique identifier for this version snapshot';
COMMENT ON COLUMN project_versions.project_id IS 'Reference to the parent project in the projects table';
COMMENT ON COLUMN project_versions.version_number IS 'Sequential version number starting at 1 for each project';
COMMENT ON COLUMN project_versions.code_snapshot IS 'Complete code snapshot at this version, stored as JSONB for flexibility';
COMMENT ON COLUMN project_versions.prompt_used IS 'The user prompt or edit request that created this version';
COMMENT ON COLUMN project_versions.created_at IS 'Timestamp when this version was created';

-- Create a function to automatically set version numbers
-- This ensures version numbers are sequential and start at 1 for each project
CREATE OR REPLACE FUNCTION set_version_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the next version number for this project
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM project_versions
    WHERE project_id = NEW.project_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set version numbers before insert
CREATE TRIGGER set_version_number_trigger
BEFORE INSERT ON project_versions
FOR EACH ROW
EXECUTE FUNCTION set_version_number();

-- Add a column to the projects table to track current version
-- This makes it easy to know which version is currently active
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1;

-- Add a comment for the new column
COMMENT ON COLUMN projects.current_version IS 'The currently active version number for this project';

-- Create a view for easier querying of version history with project details
CREATE OR REPLACE VIEW project_version_history AS
SELECT 
    pv.id AS version_id,
    pv.project_id,
    p.name AS project_name,
    p.user_id,
    pv.version_number,
    pv.prompt_used,
    pv.created_at,
    CASE 
        WHEN pv.version_number = p.current_version THEN true 
        ELSE false 
    END AS is_current,
    -- Calculate size of code snapshot for UI display
    pg_size_pretty(LENGTH(pv.code_snapshot::text)::bigint) AS code_size
FROM project_versions pv
JOIN projects p ON p.id = pv.project_id
ORDER BY pv.project_id, pv.version_number DESC;

-- Add comment for the view
COMMENT ON VIEW project_version_history IS 'Convenient view for querying project versions with additional metadata';

-- Grant appropriate permissions (adjust based on your user setup)
-- Example: GRANT SELECT, INSERT ON project_versions TO your_app_user;
-- Example: GRANT SELECT ON project_version_history TO your_app_user;

-- Migration rollback script (save this separately)
-- DROP VIEW IF EXISTS project_version_history;
-- DROP TRIGGER IF EXISTS set_version_number_trigger ON project_versions;
-- DROP FUNCTION IF EXISTS set_version_number();
-- DROP TABLE IF EXISTS project_versions;
-- ALTER TABLE projects DROP COLUMN IF EXISTS current_version;