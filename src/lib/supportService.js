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
