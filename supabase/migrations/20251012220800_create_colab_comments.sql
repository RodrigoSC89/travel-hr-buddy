-- Create colab_comments table for collaboration module
CREATE TABLE IF NOT EXISTS colab_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_colab_comments_created_at ON colab_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colab_comments_author_id ON colab_comments(author_id);

-- Enable Row Level Security (RLS)
ALTER TABLE colab_comments ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view comments
CREATE POLICY "Allow authenticated users to view comments"
  ON colab_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert their own comments
CREATE POLICY "Allow authenticated users to insert comments"
  ON colab_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy: Users can update their own comments
CREATE POLICY "Allow users to update their own comments"
  ON colab_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Allow users to delete their own comments"
  ON colab_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
