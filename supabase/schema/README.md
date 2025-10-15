# Supabase Schema Files

This directory contains SQL schema files that define database structures and extensions for the Travel HR Buddy application.

## Files

### workflow_ai_extension.sql

This file extends the workflow module with adaptive AI capabilities:

- **workflow_ai_suggestions**: Table to store AI-generated suggestions for workflows
  - Tracks task creation, deadline adjustments, and assignee changes
  - Records the source of suggestions (MMI reports, logs, checklists, manual)
  - Includes criticality levels and timestamps

- **workflow_ai_recent**: View to display suggestions from the last 30 days

### AI Integration

The schema includes documentation for AI prompt integration, allowing GitHub Copilot to:
- Analyze delays, failures, and system logs
- Generate new tasks, adjust deadlines, or suggest assignee changes
- Store suggestions in Supabase
- Display recommendations directly in the Kanban board

### Usage

These schema files can be applied to your Supabase instance by:

1. Copying the SQL content
2. Running it in the Supabase SQL Editor
3. Or creating a new migration file based on the schema

### Related Tables

- `smart_workflows`: Main workflow table (referenced by workflow_id)
- `smart_workflow_steps`: Individual workflow steps/tasks
