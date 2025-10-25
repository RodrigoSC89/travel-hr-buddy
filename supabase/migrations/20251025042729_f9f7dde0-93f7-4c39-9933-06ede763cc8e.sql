-- PATCH 123-124 Part 1: Add 'auditor' to user_role enum

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'auditor';