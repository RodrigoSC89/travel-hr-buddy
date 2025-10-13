-- Add support for replies to comments
CREATE TABLE IF NOT EXISTS colab_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES colab_comments(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add support for reactions on comments
CREATE TABLE IF NOT EXISTS colab_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES colab_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure one reaction per user per comment per emoji
  UNIQUE(comment_id, user_id, emoji)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_colab_replies_comment_id ON colab_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_colab_replies_created_at ON colab_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colab_reactions_comment_id ON colab_reactions(comment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE colab_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE colab_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for colab_replies
CREATE POLICY "Allow authenticated users to view replies"
  ON colab_replies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert replies"
  ON colab_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow users to update their own replies"
  ON colab_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow users to delete their own replies"
  ON colab_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Policies for colab_reactions
CREATE POLICY "Allow authenticated users to view reactions"
  ON colab_reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to add reactions"
  ON colab_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to remove their own reactions"
  ON colab_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
