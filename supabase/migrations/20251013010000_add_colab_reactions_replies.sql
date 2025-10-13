-- Add reactions column to colab_comments table
ALTER TABLE colab_comments ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;

-- Create colab_replies table for threaded replies
CREATE TABLE IF NOT EXISTS colab_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES colab_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_colab_replies_comment_id ON colab_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_colab_replies_created_at ON colab_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colab_replies_author_id ON colab_replies(author_id);

-- Enable Row Level Security (RLS) for colab_replies
ALTER TABLE colab_replies ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view replies
CREATE POLICY "Allow authenticated users to view replies"
  ON colab_replies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert their own replies
CREATE POLICY "Allow authenticated users to insert replies"
  ON colab_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy: Users can update their own replies
CREATE POLICY "Allow users to update their own replies"
  ON colab_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Users can delete their own replies
CREATE POLICY "Allow users to delete their own replies"
  ON colab_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
