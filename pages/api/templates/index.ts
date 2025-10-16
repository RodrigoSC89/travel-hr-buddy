// File: /pages/api/templates/index.ts

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { title, content, is_private = false } = req.body;

    const { data, error } = await supabase.from('templates').insert({
      title,
      content,
      is_private,
      created_by: user.id,
    });

    if (error) return res.status(500).json({ error });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
