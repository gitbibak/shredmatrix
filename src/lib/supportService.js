import { supabase, isSupabaseReady } from './supabase';

const CATEGORY_PRIORITY = {
  bug: 'high',
  account: 'high',
  privacy: 'high',
  support: 'normal',
  idea: 'normal',
  partnership: 'normal',
};

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export async function submitSupportTicket(input) {
  if (!isSupabaseReady()) {
    throw new Error('Destek servisi şu anda kullanılamıyor.');
  }

  const subject = cleanText(input.subject, 160);
  const message = cleanText(input.message, 4000);
  const email = cleanText(input.email, 254).toLowerCase();
  const name = cleanText(input.name, 120);
  const category = cleanText(input.category || 'support', 32);

  if (!subject || !message) {
    throw new Error('Konu ve mesaj alanları zorunlu.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  const fallbackEmail = user?.email || email || null;
  const fallbackName = user?.user_metadata?.name || name || null;

  const { error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user?.id || null,
      name: fallbackName,
      email: fallbackEmail,
      category,
      subject,
      message,
      priority: CATEGORY_PRIORITY[category] || 'normal',
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });

  if (error) throw error;
  return { ok: true };
}

export async function getMySupportTickets(limit = 20) {
  if (!isSupabaseReady()) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, category, subject, message, status, admin_note, resolved_at, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(Number(limit) || 20, 1), 50));

  if (error) throw error;
  return data || [];
}

export async function getLatestResolvedSupportTicket() {
  if (!isSupabaseReady()) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, subject, admin_note, resolved_at')
    .eq('user_id', user.id)
    .eq('status', 'resolved')
    .order('resolved_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}
