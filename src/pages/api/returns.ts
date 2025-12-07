import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { saleId } = req.body;

  if (!saleId) {
    return res.status(400).json({ error: 'saleId is required.' });
  }

  try {
    const { error } = await supabaseAdmin.rpc('create_return_and_update_stock', {
      p_original_sale_id: saleId
    });

    if (error) {
      console.error('Supabase RPC error during return:', error);
      if (error.message.includes('This sale has already been returned')) {
        return res.status(409).json({ error: 'Bu satış zaten iade edilmiş.' });
      }
      return res.status(500).json({ error: 'İade işlemi sırasında veritabanında bir hata oluştu: ' + error.message });
    }

    return res.status(200).json({ message: 'Return processed successfully.' });

  } catch (err: any) {
    console.error('API Error in /api/returns:', err);
    return res.status(500).json({ error: 'Beklenmedik bir sunucu hatası oluştu.' });
  }
}
