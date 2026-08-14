import { createClient } from 'npm:@supabase/supabase-js@2.108.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listFiles(client: ReturnType<typeof createClient>, prefix: string): Promise<string[]> {
  const { data, error } = await client.storage.from('user-photos').list(prefix, { limit: 1000 });
  if (error) throw error;

  const files: string[] = [];
  for (const item of data || []) {
    const path = `${prefix}/${item.name}`;
    if (item.id) files.push(path);
    else files.push(...await listFiles(client, path));
  }
  return files;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const authorization = req.headers.get('Authorization') || '';

    if (!supabaseUrl || !anonKey || !serviceKey || !authorization.startsWith('Bearer ')) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }

    const token = authorization.slice('Bearer '.length);
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return json({ ok: false, error: 'Unauthorized' }, 401);

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: caller, error: callerError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();
    if (callerError || caller?.role !== 'admin') return json({ ok: false, error: 'Forbidden' }, 403);

    const { userId } = await req.json();
    if (typeof userId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return json({ ok: false, error: 'Geçersiz kullanıcı kimliği.' }, 400);
    }
    if (userId === authData.user.id) return json({ ok: false, error: 'Kendi yönetici hesabınızı silemezsiniz.' }, 400);

    const { data: target } = await adminClient.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (target?.role === 'admin') return json({ ok: false, error: 'Başka bir yönetici hesabı silinemez.' }, 403);

    const files = await listFiles(adminClient, userId);
    if (files.length) {
      const { error: storageError } = await adminClient.storage.from('user-photos').remove(files);
      if (storageError) throw storageError;
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return json({ ok: true, deletedUserId: userId });
  } catch (error) {
    console.error('[admin-delete-user]', error);
    return json({ ok: false, error: 'Kullanıcı hesabı silinemedi.' }, 500);
  }
});
