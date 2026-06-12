import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pill, AlertTriangle, CheckCircle, Clock, Flame, Droplets, Sparkles, Leaf } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const itemV = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ── Goal key mapping ── */
function resolveGoalKey(goal) {
  if (!goal) return 'muscle';
  const g = goal.toLowerCase();
  if (g.includes('yağ') || g.includes('fat')) return 'fat_loss';
  if (g.includes('medit')) return 'meditation';
  if (g.includes('yoga')) return 'yoga';
  if (g.includes('pilates')) return 'pilates';
  if (g.includes('reformer')) return 'reformer';
  return 'muscle';
}

/* ── Data per goal ── */
const supplementData = {
  muscle: [
    { name: 'Kreatin Monohidrat', emoji: '⚡', dose: '5g / gün', timing: 'Antrenman sonrası', why: 'ATP yenilenmesini hızlandırır, güç ve kas hacmi artışı sağlar.', importance: 'high', color: '#ff6d00' },
    { name: 'Whey Protein', emoji: '🥛', dose: '25-30g / öğün', timing: 'Antrenman sonrası + sabah', why: 'Hızlı emilen protein kaynağı. Kas sentezini tetikler.', importance: 'high', color: '#f59e0b' },
    { name: 'BCAA / EAA', emoji: '💊', dose: '5-10g', timing: 'Antrenman sırası', why: 'Kas yıkımını azaltır, toparlanmayı hızlandırır.', importance: 'medium', color: '#00b0ff' },
    { name: 'Omega-3 (Balık Yağı)', emoji: '🐟', dose: '2-3g EPA+DHA', timing: 'Yemekle birlikte', why: 'Anti-enflamatuar, eklem sağlığı, kalp sağlığı.', importance: 'medium', color: '#22c55e' },
    { name: 'D3 Vitamini', emoji: '☀️', dose: '2000-4000 IU', timing: 'Sabah, yağlı yemekle', why: 'Testosteron desteği, kemik sağlığı, bağışıklık.', importance: 'medium', color: '#a855f7' },
    { name: 'ZMA (Çinko+Magnezyum)', emoji: '🌙', dose: '1 kapsül', timing: 'Yatmadan önce', why: 'Uyku kalitesi, kas toparlanması, hormonal denge.', importance: 'low', color: '#6366f1' },
  ],
  fat_loss: [
    { name: 'Kafein', emoji: '☕', dose: '200mg', timing: 'Antrenman öncesi 30dk', why: 'Metabolizmayı hızlandırır, yağ yakımını artırır.', importance: 'high', color: '#ff6d00' },
    { name: 'Whey Protein İzolat', emoji: '🥛', dose: '25-30g', timing: 'Antrenman sonrası + ara öğün', why: 'Düşük kalorili, yüksek proteinli. Doygunluk sağlar.', importance: 'high', color: '#f59e0b' },
    { name: 'L-Karnitin', emoji: '🔥', dose: '2-3g', timing: 'Antrenman öncesi', why: 'Yağ asitlerinin mitokondriye taşınmasını destekler.', importance: 'medium', color: '#ef4444' },
    { name: 'Yeşil Çay Ekstresi', emoji: '🍵', dose: '500mg EGCG', timing: 'Sabah + öğle', why: 'Termogenez artışı, antioksidan.', importance: 'medium', color: '#22c55e' },
    { name: 'Omega-3', emoji: '🐟', dose: '2-3g', timing: 'Yemekle birlikte', why: 'İnsülin hassasiyeti, anti-enflamatuar.', importance: 'medium', color: '#00b0ff' },
    { name: 'Multivitamin', emoji: '💊', dose: '1 tablet', timing: 'Sabah kahvaltıyla', why: 'Kalori kısıtlamasında mikro besin eksikliğini önler.', importance: 'low', color: '#a855f7' },
  ],
  meditation: [
    { name: 'Magnezyum Bisglisinat', emoji: '🧠', dose: '300-400mg', timing: 'Akşam, yatmadan 1 saat önce', why: 'Sinir sistemini yatıştırır, derin uykuyu destekler.', importance: 'high', color: '#a855f7' },
    { name: 'L-Theanine', emoji: '🍵', dose: '200mg', timing: 'Meditasyon öncesi', why: 'Alfa beyin dalgalarını artırır, sakin odaklanma sağlar.', importance: 'high', color: '#22c55e' },
    { name: 'Ashwagandha', emoji: '🌿', dose: '300-600mg', timing: 'Sabah veya akşam', why: 'Kortizol seviyesini düşürür, stres adaptasyonunu artırır.', importance: 'medium', color: '#f59e0b' },
    { name: 'Omega-3 (DHA)', emoji: '🐟', dose: '1-2g DHA', timing: 'Yemekle birlikte', why: 'Beyin sağlığı, bilişsel fonksiyon desteği.', importance: 'medium', color: '#00b0ff' },
    { name: 'B Kompleks Vitamin', emoji: '💊', dose: '1 tablet', timing: 'Sabah', why: 'Sinir sistemi sağlığı, enerji metabolizması.', importance: 'low', color: '#6366f1' },
  ],
  yoga: [
    { name: 'Magnezyum', emoji: '✨', dose: '300-400mg', timing: 'Akşam', why: 'Kas gevşemesi, kramp önleme, esneklik desteği.', importance: 'high', color: '#a855f7' },
    { name: 'D3 Vitamini', emoji: '☀️', dose: '2000-4000 IU', timing: 'Sabah, yağlı yemekle', why: 'Kemik sağlığı, eklem desteği, bağışıklık.', importance: 'high', color: '#f59e0b' },
    { name: 'Kolajen Peptid', emoji: '🦴', dose: '10g', timing: 'Sabah veya akşam', why: 'Eklem, tendon ve bağ doku sağlığını destekler.', importance: 'medium', color: '#22c55e' },
    { name: 'Zerdeçal (Curcumin)', emoji: '🟡', dose: '500mg + Piperin', timing: 'Yemekle birlikte', why: 'Anti-enflamatuar, eklem rahatlığı.', importance: 'medium', color: '#ff6d00' },
    { name: 'Omega-3', emoji: '🐟', dose: '2g EPA+DHA', timing: 'Yemekle birlikte', why: 'Esneklik desteği, anti-enflamatuar.', importance: 'low', color: '#00b0ff' },
  ],
  pilates: [
    { name: 'Kolajen Peptid', emoji: '🦴', dose: '10-15g', timing: 'Sabah veya antrenman öncesi', why: 'Eklem, tendon ve bağ doku sağlığı. Derin kas desteği.', importance: 'high', color: '#06b6d4' },
    { name: 'Magnezyum', emoji: '✨', dose: '300-400mg', timing: 'Akşam', why: 'Kas gevşemesi, kramp önleme, toparlanma.', importance: 'high', color: '#a855f7' },
    { name: 'D3 + K2 Vitamini', emoji: '☀️', dose: '2000 IU D3 + 100mcg K2', timing: 'Sabah', why: 'Kemik yoğunluğu, kalsiyum emilimi.', importance: 'medium', color: '#f59e0b' },
    { name: 'Elektrolit Takviyesi', emoji: '💧', dose: 'Antrenman sırası', timing: 'Egzersiz sırasında', why: 'Sodyum, potasyum, magnezyum dengesi. Kramp önleme.', importance: 'medium', color: '#22c55e' },
    { name: 'B12 Vitamini', emoji: '💊', dose: '1000mcg', timing: 'Sabah', why: 'Enerji üretimi, sinir sistemi sağlığı.', importance: 'low', color: '#ef4444' },
  ],
  reformer: [
    { name: 'Kolajen Peptid', emoji: '🦴', dose: '10-15g', timing: 'Sabah', why: 'Eklem ve bağ doku sağlığı. Reformer direncine karşı koruma.', importance: 'high', color: '#22c55e' },
    { name: 'Whey Protein', emoji: '🥛', dose: '20-25g', timing: 'Antrenman sonrası', why: 'Kas onarımı ve toparlanma. Reformer yoğun kas çalıştırır.', importance: 'high', color: '#f59e0b' },
    { name: 'Magnezyum', emoji: '✨', dose: '300-400mg', timing: 'Akşam', why: 'Kas gevşemesi, kramp önleme, uyku kalitesi.', importance: 'medium', color: '#a855f7' },
    { name: 'Zerdeçal (Curcumin)', emoji: '🟡', dose: '500mg + Piperin', timing: 'Yemekle', why: 'Anti-enflamatuar, eklem koruma.', importance: 'medium', color: '#ff6d00' },
    { name: 'Elektrolit', emoji: '💧', dose: 'Egzersiz sırası', timing: 'Antrenman sırasında', why: 'Terleme ile kaybedilen mineral dengesi.', importance: 'low', color: '#06b6d4' },
  ],
};

/* ── Goal labels ── */
const goalLabels = {
  muscle: 'muscleGoal', fat_loss: 'fatGoal',
  meditation: 'meditationGoal', yoga: 'yogaGoal',
  pilates: 'pilatesGoal', reformer: 'reformerGoal',
};

/* ── Section titles per goal type ── */
const sectionConfig = {
  muscle: { icon: Pill, titleKey: 'title' },
  fat_loss: { icon: Pill, titleKey: 'title' },
  meditation: { icon: Leaf, titleKey: 'titleWellness' },
  yoga: { icon: Leaf, titleKey: 'titleWellness' },
  pilates: { icon: Sparkles, titleKey: 'title' },
  reformer: { icon: Sparkles, titleKey: 'title' },
};

const importanceIcons = { high: CheckCircle, medium: Flame, low: Clock };
const importanceColors = { high: '#22c55e', medium: '#f59e0b', low: '#64748b' };

export default function SupplementGuide({ goal }) {
  const { t } = useTranslation();
  const goalKey = resolveGoalKey(goal);
  const supplements = useMemo(() => supplementData[goalKey] || supplementData.muscle, [goalKey]);
  const importanceLabels = { high: t('supplement.important'), medium: t('supplement.useful'), low: t('supplement.optional') };
  const config = sectionConfig[goalKey] || sectionConfig.muscle;
  const HeaderIcon = config.icon;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      {/* Header */}
      <motion.div variants={itemV} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HeaderIcon size={16} className="text-orange-400" />
          <h3 className="text-sm font-bold font-outfit text-white">
            {t(`supplement.${config.titleKey}`) || 'Takviye & Destek Rehberi'}
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {t(`supplement.${goalLabels[goalKey]}`) || goal}
        </span>
      </motion.div>

      {/* Warning */}
      <motion.div variants={itemV} className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-4">
        <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          {t(`supplement.warning_${goalKey}`) || t('supplement.warning')}
        </p>
      </motion.div>

      {/* Supplement cards */}
      <div className="space-y-2">
        {supplements.map((sup) => {
          const ImpIcon = importanceIcons[sup.importance];
          return (
            <motion.div
              key={sup.name}
              variants={itemV}
              className="flex items-start gap-3 px-3 py-3 rounded-xl bg-slate-950/50 border border-slate-800/50"
            >
              <span className="text-xl mt-0.5">{sup.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-white font-outfit">{sup.name}</span>
                  <span
                    className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${importanceColors[sup.importance]}15`,
                      color: importanceColors[sup.importance],
                    }}
                  >
                    <ImpIcon size={8} />
                    {importanceLabels[sup.importance]}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1.5">{sup.why}</p>
                <div className="flex items-center gap-3 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Droplets size={9} /> {sup.dose}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={9} /> {sup.timing}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
