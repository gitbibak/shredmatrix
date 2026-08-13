import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Ruler, Dumbbell, Flame, Wallet, Clock,
  LogOut, Trash2, RefreshCw, Heart, Sparkles, Scale, Activity,
  Camera, ImagePlus, X, ChevronLeft, ChevronRight,
  TrendingUp, Brain, Flower2, Circle, Wrench, Target, BadgeCheck, Globe,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { generatePlan } from '../data/planGenerator';
import { deleteAllUserData, getProfilePhoto, getProgressPhotos, uploadPhoto, deleteProgressPhoto } from '../lib/dataService';
import { useToast } from './ToastProvider';

const PHOTO_KEY = 'shredmatrix_profile_photo';
const PHOTO_EXPIRY_KEY = 'shredmatrix_profile_photo_expires';
const GALLERY_KEY = 'shredmatrix_progress_photos';
const LOCALE_MAP = { tr: 'tr-TR', en: 'en-US', es: 'es-ES' };

const containerV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemV = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function StatCard({ icon: Icon, label, value, unit, color = '#ff6d00', sub, tone = 'neutral' }) {
  const toneClass = {
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    danger: 'text-red-400',
    neutral: 'text-slate-500',
  }[tone] || 'text-slate-500';

  return (
    <motion.div variants={itemV} className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-3 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}14` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-[10px] text-slate-400 font-outfit truncate">{label}</span>
      </div>
      <span className="block text-base font-bold text-white font-outfit truncate">
        {value ?? '—'}{unit && <span className="text-xs text-slate-400 ml-0.5">{unit}</span>}
      </span>
      {sub && <span className={`block text-[9px] mt-1 truncate ${toneClass}`}>{sub}</span>}
    </motion.div>
  );
}

function Badge({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
      {children}
    </span>
  );
}

function loadPhoto() {
  try {
    const raw = localStorage.getItem(PHOTO_KEY);
    if (!raw) return null;
    let photo = raw;
    try { photo = JSON.parse(raw); } catch { /* Legacy raw value. */ }
    if (typeof photo !== 'string') return null;
    if (photo.startsWith('data:')) return photo;
    const expiresRaw = localStorage.getItem(PHOTO_EXPIRY_KEY);
    const expiresAt = expiresRaw ? Number(JSON.parse(expiresRaw)) : 0;
    return expiresAt > Date.now() + 30_000 ? photo : null;
  } catch (err) { console.warn('[Profile]', err?.message || err); return null; }
}
function savePhoto(dataUrl) {
  try {
    localStorage.setItem(PHOTO_KEY, JSON.stringify(dataUrl));
    if (dataUrl?.startsWith('data:')) localStorage.removeItem(PHOTO_EXPIRY_KEY);
    else localStorage.setItem(PHOTO_EXPIRY_KEY, JSON.stringify(Date.now() + 55 * 60 * 1000));
  } catch (err) { console.warn('[Profile]', err?.message || err); }
}

function loadGallery() {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) { console.warn('[Profile]', err?.message || err); return []; }
}
function saveGallery(arr) {
  try { localStorage.setItem(GALLERY_KEY, JSON.stringify(arr)); } catch (err) { console.warn('[Profile]', err?.message || err); }
}

function normalizeGoal(goal) {
  const key = String(goal || '').toLowerCase();
  if (key.includes('fat') || key.includes('yağ')) return 'fat_loss';
  if (key.includes('yoga')) return 'yoga';
  if (key.includes('pilates')) return 'pilates';
  if (key.includes('reformer')) return 'reformer';
  if (key.includes('meditation') || key.includes('meditasyon')) return 'meditation';
  return 'muscle';
}

function getBmiStatus(bmi, lang) {
  const value = Number(bmi);
  if (!Number.isFinite(value)) return { label: '-', tone: 'neutral' };
  if (value < 18.5) return { label: lang === 'tr' ? 'Düşük' : 'Low', tone: 'warn' };
  if (value < 25) return { label: lang === 'tr' ? 'Normal' : 'Normal', tone: 'good' };
  if (value < 30) return { label: lang === 'tr' ? 'Yüksek' : 'High', tone: 'warn' };
  return { label: lang === 'tr' ? 'Çok yüksek' : 'Very high', tone: 'danger' };
}

function getGoalProfile(plan, lang) {
  const goalKey = normalizeGoal(plan.primaryGoal || plan.goal);
  const dailyCalories = Number(plan.dailyCalories || 0);
  const tdee = Number(plan.tdee || 0);
  const calorieDelta = dailyCalories && tdee ? Math.round(dailyCalories - tdee) : null;
  const trainingDays = plan.trainingDays || plan.workoutSplit?.filter((day) => !day.isRest).length || 0;
  const protein = plan.macros?.protein;

  const copy = {
    muscle: {
      title: lang === 'tr' ? 'Kas gelişimi modu' : 'Muscle growth mode',
      focus: lang === 'tr' ? 'Kalori fazlası, progresif yüklenme ve protein takibi öncelikli.' : 'Prioritize surplus calories, progressive overload and protein.',
      primary: calorieDelta == null ? '-' : `${calorieDelta >= 0 ? '+' : ''}${calorieDelta} kcal`,
      primaryLabel: lang === 'tr' ? 'TDEE farkı' : 'TDEE delta',
      secondary: protein ? `${protein}g` : '-',
      secondaryLabel: lang === 'tr' ? 'Protein hedefi' : 'Protein target',
      action: lang === 'tr' ? 'Haftalık kilo artışı 0.25-0.5 kg aralığında kalmalı.' : 'Keep weekly gain around 0.25-0.5 kg.',
      color: '#ff6d00',
    },
    fat_loss: {
      title: lang === 'tr' ? 'Yağ yakımı modu' : 'Fat loss mode',
      focus: lang === 'tr' ? 'Kalori açığı, adım/aktivite ve bel ölçüsü takibi öncelikli.' : 'Prioritize deficit, activity and waist tracking.',
      primary: calorieDelta == null ? '-' : `${calorieDelta} kcal`,
      primaryLabel: lang === 'tr' ? 'TDEE farkı' : 'TDEE delta',
      secondary: plan.userBodyFat ? `%${plan.userBodyFat}` : '-',
      secondaryLabel: lang === 'tr' ? 'Yağ oranı' : 'Body fat',
      action: lang === 'tr' ? 'Açık sürdürülebilir kalmalı; performans düşerse kaloriyi yeniden değerlendir.' : 'Keep the deficit sustainable; review calories if performance drops.',
      color: '#00b0ff',
    },
    yoga: {
      title: lang === 'tr' ? 'Yoga modu' : 'Yoga mode',
      focus: lang === 'tr' ? 'Mobilite, nefes, toparlanma ve düzenli pratik öncelikli.' : 'Prioritize mobility, breath, recovery and consistent practice.',
      primary: `${trainingDays}`,
      primaryLabel: lang === 'tr' ? 'Pratik günü' : 'Practice days',
      secondary: plan.userActivityLevel ? activityLabelFromPlan(plan, lang) : '-',
      secondaryLabel: lang === 'tr' ? 'Aktivite' : 'Activity',
      action: lang === 'tr' ? 'Haftada en az 3 pratik ve 1 toparlanma günü dengeli olur.' : 'Aim for at least 3 practice days and 1 recovery day.',
      color: '#a855f7',
    },
    pilates: {
      title: lang === 'tr' ? 'Pilates modu' : 'Pilates mode',
      focus: lang === 'tr' ? 'Core, postür, kontrollü tempo ve düzenli ölçüm öncelikli.' : 'Prioritize core, posture, controlled tempo and measurements.',
      primary: `${trainingDays}`,
      primaryLabel: lang === 'tr' ? 'Seans/hafta' : 'Sessions/week',
      secondary: plan.userBodyFat ? `%${plan.userBodyFat}` : '-',
      secondaryLabel: lang === 'tr' ? 'Yağ oranı' : 'Body fat',
      action: lang === 'tr' ? 'Bel/kalça ölçülerini 2 haftada bir takip etmek daha anlamlıdır.' : 'Track waist/hip measurements every 2 weeks.',
      color: '#ec4899',
    },
    reformer: {
      title: lang === 'tr' ? 'Reformer modu' : 'Reformer mode',
      focus: lang === 'tr' ? 'Kontrollü direnç, hareket kalitesi ve toparlanma öncelikli.' : 'Prioritize controlled resistance, movement quality and recovery.',
      primary: `${trainingDays}`,
      primaryLabel: lang === 'tr' ? 'Seans/hafta' : 'Sessions/week',
      secondary: plan.userExperience ? experienceLabelFromPlan(plan, lang) : '-',
      secondaryLabel: lang === 'tr' ? 'Seviye' : 'Level',
      action: lang === 'tr' ? 'Zor seanslardan sonra uyku ve mobilite takibi önemli.' : 'After hard sessions, watch sleep and mobility.',
      color: '#14b8a6',
    },
    meditation: {
      title: lang === 'tr' ? 'Meditasyon modu' : 'Meditation mode',
      focus: lang === 'tr' ? 'Stres yönetimi, uyku kalitesi ve günlük süreklilik öncelikli.' : 'Prioritize stress control, sleep quality and daily consistency.',
      primary: `${trainingDays}`,
      primaryLabel: lang === 'tr' ? 'Pratik günü' : 'Practice days',
      secondary: plan.userWorkSchedule ? scheduleLabelFromPlan(plan, lang) : '-',
      secondaryLabel: lang === 'tr' ? 'Zaman tercihi' : 'Timing',
      action: lang === 'tr' ? 'Kısa ama günlük pratik, uzun düzensiz pratikten daha değerlidir.' : 'Short daily practice beats long inconsistent sessions.',
      color: '#8b5cf6',
    },
  };

  return copy[goalKey] || copy.muscle;
}

function activityLabelFromPlan(plan, lang) {
  const labels = {
    sedentary: lang === 'tr' ? 'Hareketsiz' : 'Sedentary',
    light: lang === 'tr' ? 'Hafif aktif' : 'Light',
    moderate: lang === 'tr' ? 'Orta aktif' : 'Moderate',
    active: lang === 'tr' ? 'Aktif' : 'Active',
    athlete: lang === 'tr' ? 'Çok aktif' : 'Very active',
    veryActive: lang === 'tr' ? 'Çok aktif' : 'Very active',
  };
  return labels[plan.userActivityLevel] || '-';
}

function experienceLabelFromPlan(plan, lang) {
  const labels = {
    beginner: lang === 'tr' ? 'Başlangıç' : 'Beginner',
    intermediate: lang === 'tr' ? 'Orta' : 'Intermediate',
    advanced: lang === 'tr' ? 'İleri' : 'Advanced',
    expert: lang === 'tr' ? 'Uzman' : 'Expert',
  };
  return labels[plan.userExperience] || '-';
}

function scheduleLabelFromPlan(plan, lang) {
  const labels = {
    morning: lang === 'tr' ? 'Sabah' : 'Morning',
    afternoon: lang === 'tr' ? 'Öğlen' : 'Afternoon',
    evening: lang === 'tr' ? 'Akşam' : 'Evening',
    flexible: lang === 'tr' ? 'Esnek' : 'Flexible',
    none: lang === 'tr' ? 'Esnek' : 'Flexible',
  };
  return labels[plan.userWorkSchedule] || '-';
}

export default function ProfilePage({ plan, user, onLogout, onUpdatePlan, onPlanUpdate }) {
  const { t, lang, setLang, SUPPORTED, langLabels, langFlags } = useTranslation();
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [profilePhoto, setProfilePhoto] = useState(loadPhoto);
  const [gallery, setGallery] = useState(loadGallery);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [showProgressPhotos, setShowProgressPhotos] = useState(false);
  const [showGoalChange, setShowGoalChange] = useState(false);
  const [changingGoal, setChangingGoal] = useState(null);
  const toast = useToast();

  // Lock body scroll when lightbox is open (iOS Safari compatible)
  useEffect(() => {
    if (lightboxIdx !== null) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [lightboxIdx]);

  useEffect(() => {
    let cancelled = false;
    async function loadProfilePhoto() {
      try {
        const photo = await getProfilePhoto();
        if (cancelled) return;
        if (photo) {
          setProfilePhoto(photo);
          savePhoto(photo);
        }
      } catch (err) {
        console.warn('[Profile]', err?.message || err);
      }
    }
    loadProfilePhoto();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showProgressPhotos || galleryLoaded) return undefined;
    let cancelled = false;
    async function loadProgressPhotos() {
      setGalleryLoading(true);
      try {
        const photos = await getProgressPhotos();
        if (cancelled) return;
        setGallery(photos || []);
        saveGallery(photos || []);
        setGalleryLoaded(true);
      } catch (err) {
        console.warn('[Profile]', err?.message || err);
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    }
    loadProgressPhotos();
    return () => {
      cancelled = true;
    };
  }, [showProgressPhotos, galleryLoaded]);

  const goalOptions = [
    { value: 'muscle', icon: TrendingUp, label: t('onboarding.fields.muscle'), color: '#ff6d00' },
    { value: 'fat_loss', icon: Flame, label: t('onboarding.fields.fatLoss'), color: '#00b0ff' },
    { value: 'yoga', icon: Flower2, label: t('onboarding.fields.yoga'), color: '#a855f7' },
    { value: 'pilates', icon: Circle, label: t('onboarding.fields.pilates'), color: '#ec4899' },
    { value: 'reformer', icon: Wrench, label: t('onboarding.fields.reformer'), color: '#14b8a6' },
    { value: 'meditation', icon: Brain, label: t('onboarding.fields.meditation'), color: '#8b5cf6' },
  ];

  if (!plan) return null;

  const goalMap = { 'Kas Gelişimi': 'muscle', 'Yağ Yakımı': 'fat_loss', 'Meditasyon': 'meditation', 'Yoga': 'yoga', 'Pilates': 'pilates', 'Reformer': 'reformer' };
  const currentGoalKey = goalMap[plan.goal] || normalizeGoal(plan.primaryGoal || plan.goal);
  const experienceLabel = {
    beginner: t('onboarding.fields.beginner'),
    intermediate: t('onboarding.fields.intermediate'),
    advanced: t('onboarding.fields.advanced'),
    expert: t('onboarding.fields.expert'),
  }[plan.userExperience] || '';
  const activityLabel = {
    sedentary: t('onboarding.fields.sedentary'),
    light: t('onboarding.fields.light'),
    moderate: t('onboarding.fields.moderate'),
    active: t('onboarding.fields.active'),
    athlete: t('onboarding.fields.veryActive'),
    veryActive: t('onboarding.fields.veryActive'),
  }[plan.userActivityLevel] || '';
  const budgetLabel = {
    economy: t('onboarding.fields.low'),
    moderate: t('onboarding.fields.mid'),
    premium: t('onboarding.fields.high'),
  }[plan.userBudget] || '';
  const scheduleLabel = {
    morning: t('onboarding.fields.morning'),
    afternoon: t('onboarding.fields.afternoon'),
    evening: t('onboarding.fields.evening'),
    flexible: t('onboarding.fields.flexible'),
    none: t('onboarding.fields.flexible'),
  }[plan.userWorkSchedule] || '';
  const bmiStatus = getBmiStatus(plan.bmi, lang);
  const goalProfile = getGoalProfile(plan, lang);
  const calorieDelta = Number(plan.dailyCalories || 0) && Number(plan.tdee || 0)
    ? Math.round(Number(plan.dailyCalories) - Number(plan.tdee))
    : null;
  const trainingDays = plan.trainingDays || plan.workoutSplit?.filter(d => !d.isRest).length || null;

  const handleGoalChange = (newGoal) => {
    if (newGoal === currentGoalKey) return;
    setChangingGoal(newGoal);
    const userMetrics = {
      name: plan.userName,
      age: plan.userAge,
      gender: plan.userGender,
      height: plan.userHeight,
      weight: plan.userWeight,
      bodyFatPercentage: plan.userBodyFat,
      experience: plan.userExperience,
      activityLevel: plan.userActivityLevel || 'moderate',
      primaryGoal: newGoal,
      budget: plan.userBudget,
      workSchedule: plan.userWorkSchedule,
      trainingEnvironment: newGoal === 'reformer'
        ? 'studio'
        : (plan.trainingEnvironment === 'studio' || plan.trainingEnvironment === 'home_reformer' ? 'gym' : plan.trainingEnvironment),
      healthConditions: plan.healthConditions || ['none'],
      allergies: plan.allergies || ['none'],
    };
    const newPlan = generatePlan(userMetrics, 0);
    // Reset phase tracking
    localStorage.setItem('shredmatrix_current_phase', '0');
    localStorage.setItem('shredmatrix_plan_created', new Date().toISOString());
    if (onPlanUpdate) onPlanUpdate(newPlan);
    setTimeout(() => {
      setChangingGoal(null);
      setShowGoalChange(false);
    }, 800);
  };

  const initials = (plan.userName || user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Photo handlers ──
  const handleProfilePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previousPhoto = profilePhoto;
    const previewUrl = URL.createObjectURL(file);
    setProfilePhoto(previewUrl);
    try {
      const url = await uploadPhoto(file, 'profile');
      setProfilePhoto(url);
      savePhoto(url);
      toast.success(t('errors.saveSuccess'));
    } catch (err) {
      setProfilePhoto(previousPhoto);
      toast.error(t('errors.uploadFailed'));
    } finally {
      URL.revokeObjectURL(previewUrl);
      e.target.value = '';
    }
  };

  const handleGalleryPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto(file, 'progress');
      const updated = await getProgressPhotos();
      setGallery(updated || []);
      saveGallery(updated || []);
      setGalleryLoaded(true);
      setShowProgressPhotos(true);
      toast.success(t('errors.saveSuccess'));
    } catch (err) {
      toast.error(t('errors.uploadFailed'));
    } finally {
      e.target.value = '';
    }
  };

  const deleteGalleryPhoto = async (id) => {
    if (!window.confirm(t('profile.deletePhotoConfirm'))) return;
    // Find the photo to get its name for Supabase deletion
    const photo = gallery.find((p) => p.id === id);
    // Optimistic UI update
    const updated = gallery.filter((p) => p.id !== id);
    setGallery(updated);
    saveGallery(updated);
    if (lightboxIdx !== null) setLightboxIdx(null);
    // Delete from Supabase Storage
    if (photo?.name) {
      try {
        const refreshed = await deleteProgressPhoto(photo.name);
        if (refreshed) {
          setGallery(refreshed);
          saveGallery(refreshed);
        }
      } catch (err) {
        console.warn('[Profile]', err?.message || err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('profile.deleteConfirm'))) return;
    try {
      await deleteAllUserData(user?.email);
    } catch (err) { console.warn('[Profile]', err?.message || err);
      toast.error(t('errors.deleteFailed'));
      return;
    }
    onLogout();
  };

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-6">

      {/* ── Profile Header ── */}
      <motion.div variants={itemV} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        {/* Avatar with photo upload */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center shadow-lg shadow-orange-500/20 overflow-hidden relative">
            {/* Always show initials as fallback background */}
            <span className="text-2xl font-bold font-outfit text-white">{initials}</span>
            {/* Overlay the photo on top with fade-in */}
            {profilePhoto && (
              <img
                src={profilePhoto}
                alt="Profile"
                loading="eager"
                decoding="sync"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Fotoğraf değiştir"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 border-2 border-slate-900 flex items-center justify-center text-white cursor-pointer hover:bg-orange-400 transition-colors shadow-lg"
          >
            <Camera size={12} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePhoto}
          />
        </div>

        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold font-outfit text-white">{plan.userName || t('profile.user')}</h2>
          {user?.email && (
            <p className="text-sm text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Mail size={12} />
              {user.email}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/15 to-blue-500/15 border border-orange-500/20 text-xs font-semibold text-orange-400">
              {plan.goal}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              {plan.dailyCalories} {t('profile.kcalDay')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Progress Photos Gallery ── */}
      <motion.div variants={itemV}>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <Camera size={16} />
            </div>
            <button
              type="button"
              onClick={() => setShowProgressPhotos((value) => !value)}
              className="min-w-0 flex-1 text-left"
            >
              <h3 className="truncate text-sm font-bold font-outfit text-white">
                {t('profile.progressPhotos')}
              </h3>
              <p className="text-[10px] leading-relaxed text-slate-500">
                {gallery.length > 0
                  ? `${gallery.length} ${lang === 'tr' ? 'fotoğraf kayıtlı' : 'photos saved'}`
                  : (lang === 'tr' ? 'İsteğe bağlı · Karşılaştırmak için aç' : 'Optional · Open to compare')}
              </p>
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
              aria-label={t('profile.addPhoto')}
            >
              <ImagePlus size={13} />
              <span className="hidden sm:inline">{t('profile.addPhoto')}</span>
            </motion.button>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGalleryPhoto}
          />

          <AnimatePresence initial={false}>
            {showProgressPhotos && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {galleryLoading ? (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-4">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
                    <p className="text-xs text-slate-500">{lang === 'tr' ? 'Fotoğraflar yükleniyor' : 'Loading photos'}</p>
                  </div>
                ) : gallery.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-center">
                    <p className="text-xs text-slate-500">{t('profile.noPhotos')}</p>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {gallery.map((photo, idx) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                        onClick={() => setLightboxIdx(idx)}
                      >
                        <img src={photo.src} alt="Fotoğraf" className="h-full w-full object-cover" loading="lazy" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                          <span className="text-[10px] font-medium text-white/80">{new Date(photo.date).toLocaleDateString(LOCALE_MAP[lang] || 'tr-TR', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx !== null && gallery[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
            onClick={() => setLightboxIdx(null)}
          >
            <button
              onClick={() => setLightboxIdx(null)}
              aria-label="Kapat"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 z-10"
            >
              <X size={20} />
            </button>
            {lightboxIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
                aria-label="Önceki"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 z-10"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {lightboxIdx < gallery.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
                aria-label="Sonraki"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 z-10"
              >
                <ChevronRight size={20} />
              </button>
            )}
            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={gallery[lightboxIdx].src}
              alt="Fotoğraf"
              className="max-w-full max-h-[75vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <p className="text-white text-sm font-outfit bg-black/50 px-4 py-1.5 rounded-full">
                {new Date(gallery[lightboxIdx].date).toLocaleDateString(LOCALE_MAP[lang] || 'tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); deleteGalleryPhoto(gallery[lightboxIdx].id); setLightboxIdx(null); }}
                className="w-9 h-9 rounded-full bg-red-500/80 flex items-center justify-center text-white cursor-pointer hover:bg-red-500 transition-colors"
                aria-label="Delete photo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Goal Intelligence ── */}
      <motion.div variants={itemV}>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: goalProfile.color }} />
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                {lang === 'tr' ? 'Kişisel hedef paneli' : 'Personal goal panel'}
              </p>
              <h3 className="text-base font-bold font-outfit text-white">{goalProfile.title}</h3>
              <p className="text-[11px] leading-relaxed text-slate-400 mt-1">{goalProfile.focus}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${goalProfile.color}18` }}>
                <Target size={21} style={{ color: goalProfile.color }} />
              </div>
              <button
                type="button"
                onClick={() => setShowGoalChange((value) => !value)}
                className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-orange-400 transition-colors hover:bg-orange-500/20"
              >
                {showGoalChange ? (t('profile.close') || 'Kapat') : (t('profile.changeGoal') || 'Değiştir')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3">
              <p className="text-[9px] text-slate-500 mb-1">{goalProfile.primaryLabel}</p>
              <p className="text-lg font-black font-outfit text-white">{goalProfile.primary}</p>
            </div>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3">
              <p className="text-[9px] text-slate-500 mb-1">{goalProfile.secondaryLabel}</p>
              <p className="text-lg font-black font-outfit text-white">{goalProfile.secondary}</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/50 border border-slate-800/60 px-3 py-2">
            <p className="text-[10px] leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-200">{lang === 'tr' ? 'Öneri: ' : 'Suggestion: '}</span>
              {goalProfile.action}
            </p>
          </div>

          <AnimatePresence initial={false}>
            {showGoalChange && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {goalOptions.map((goal) => {
                    const Icon = goal.icon;
                    const isActive = goal.value === currentGoalKey;
                    const isChanging = changingGoal === goal.value;
                    return (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => !isActive && handleGoalChange(goal.value)}
                        disabled={isActive || changingGoal !== null}
                        className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-center transition-colors ${isActive ? 'cursor-not-allowed border-slate-700 bg-slate-800/50 opacity-50' : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'}`}
                      >
                        {isChanging ? <BadgeCheck size={19} className="text-green-400" /> : <Icon size={19} style={{ color: goal.color }} />}
                        <span className="text-[10px] font-medium text-slate-300">{isChanging ? (t('profile.switching') || 'Geçiliyor...') : goal.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-[9px] text-slate-500">
                  {t('profile.goalChangeNote') || 'Hedef değiştirildiğinde program yeniden oluşturulur.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Body Stats ── */}
      <motion.div variants={itemV}>
        <h3 className="text-sm font-bold font-outfit text-white mb-3 flex items-center gap-2">
          <Activity size={14} className="text-orange-400" />
          {t('profile.bodyStats')}
        </h3>
        <motion.div variants={containerV} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard icon={Ruler} label={t('profile.height')} value={plan.userHeight} unit="cm" color="#00b0ff" sub={lang === 'tr' ? 'Profil ölçüsü' : 'Profile metric'} />
          <StatCard icon={Scale} label={t('profile.weight')} value={plan.userWeight} unit="kg" color="#ff6d00" sub={currentGoalKey === 'muscle' ? (lang === 'tr' ? 'Haftalık trend önemli' : 'Watch weekly trend') : (lang === 'tr' ? 'Bel ölçüsüyle takip et' : 'Track with waist')} />
          <StatCard icon={Heart} label={t('profile.bmi')} value={plan.bmi} color="#f472b6" sub={bmiStatus.label} tone={bmiStatus.tone} />
          <StatCard icon={Flame} label={t('profile.bodyFat')} value={plan.userBodyFat ? `%${plan.userBodyFat}` : '—'} color="#ef4444" sub={currentGoalKey === 'fat_loss' ? (lang === 'tr' ? 'Ana takip metriği' : 'Primary metric') : (lang === 'tr' ? 'Kompozisyon' : 'Composition')} />
          <StatCard icon={Sparkles} label={t('profile.bmr')} value={plan.bmr} unit="kcal" color="#22c55e" sub={lang === 'tr' ? 'Baz metabolizma' : 'Base burn'} />
          <StatCard icon={Activity} label={t('profile.tdee')} value={plan.tdee} unit="kcal" color="#a855f7" sub={lang === 'tr' ? 'Koruma kalorisi' : 'Maintenance'} />
          <StatCard icon={Dumbbell} label={t('profile.dailyCal')} value={plan.dailyCalories} unit="kcal" color="#ff6d00" sub={calorieDelta == null ? '-' : `${calorieDelta >= 0 ? '+' : ''}${calorieDelta} ${lang === 'tr' ? 'kcal fark' : 'kcal delta'}`} tone={calorieDelta == null ? 'neutral' : calorieDelta >= 0 ? 'good' : 'warn'} />
          <StatCard icon={Target} label={t('dashboard.quickStats.training') || 'Antrenman'} value={trainingDays || '—'} unit={t('dashboard.quickStats.daysWeek') || 'gün/h'} color="#06b6d4" sub={trainingDays >= 5 ? (lang === 'tr' ? 'Yüksek hacim' : 'High volume') : (lang === 'tr' ? 'Orta hacim' : 'Moderate')} />
        </motion.div>
      </motion.div>

      {/* ── Preferences ── */}
      <motion.div variants={itemV}>
        <h3 className="text-sm font-bold font-outfit text-white mb-3 flex items-center gap-2">
          <User size={14} className="text-blue-400" />
          {t('profile.preferences')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { Icon: Target, label: t('profile.prefExperience') || 'Deneyim', value: experienceLabel, color: '#f97316' },
            { Icon: Activity, label: t('profile.prefActivity') || 'Aktivite', value: activityLabel, color: '#22c55e' },
            { Icon: Wallet, label: t('profile.prefBudget') || 'Bütçe', value: budgetLabel, color: '#a855f7' },
            { Icon: Clock, label: t('profile.prefSchedule') || 'Zaman', value: scheduleLabel, color: '#06b6d4' },
            { Icon: User, label: t('profile.prefGender') || 'Cinsiyet', value: plan.userGender === 'female' ? t('profile.female') : t('profile.male'), color: '#f472b6' },
            { Icon: Flame, label: t('profile.prefAge') || 'Yaş', value: plan.userAge ? `${plan.userAge} ${t('profile.age')}` : null, color: '#ef4444' },
          ].filter(item => {
            const v = item.value;
            return v && v !== 'undefined' && v.trim() !== '';
          }).map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/30">
              <item.Icon size={14} style={{ color: item.color }} />
              <div className="min-w-0">
                <p className="text-[9px] text-slate-500 leading-tight">{item.label}</p>
                <p className="text-xs font-medium text-slate-200 font-outfit truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Language ── */}
      <motion.div variants={itemV}>
        <h3 className="text-sm font-bold font-outfit text-white mb-3 flex items-center gap-2">
          <Globe size={14} className="text-cyan-400" />
          {t('profile.language') || 'Uygulama Dili'}
        </h3>
        <div className="flex gap-2">
          {SUPPORTED.map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer',
                lang === code
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600',
              ].join(' ')}
            >
              <span className="text-base">{langFlags[code]}</span>
              {langLabels[code]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Actions ── */}
      <motion.div variants={itemV} className="space-y-3">
        <h3 className="text-sm font-bold font-outfit text-white mb-3 flex items-center gap-2">
          <RefreshCw size={14} className="text-emerald-400" />
          {t('profile.accountActions')}
        </h3>

        {onUpdatePlan && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onUpdatePlan}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className="text-orange-400" />
            <div className="text-left">
              <p className="text-sm font-semibold">{t('profile.update')}</p>
              <p className="text-[10px] text-slate-400">{t('profile.updateDesc')}</p>
            </div>
          </motion.button>
        )}

        {onLogout && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <LogOut size={16} className="text-blue-400" />
            <div className="text-left">
              <p className="text-sm font-semibold">{t('profile.logoutBtn')}</p>
              <p className="text-[10px] text-slate-400">{t('profile.logoutDesc')}</p>
            </div>
          </motion.button>
        )}

        <Link
          to="/contact"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Mail size={16} className="text-emerald-400" />
          <div className="text-left">
            <p className="text-sm font-semibold">{t('profile.contactSupport')}</p>
            <p className="text-[10px] text-slate-400">{t('profile.contactSupportDesc')}</p>
          </div>
        </Link>

        {/* Danger zone */}
        <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-400 font-semibold mb-2">{t('profile.dangerZone')}</p>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
            <div className="text-left">
              <p className="text-sm font-semibold">{t('profile.deleteAccount')}</p>
              <p className="text-[10px] text-red-400/60">{t('profile.deleteDesc')}</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* ── App Info ── */}
      <motion.div variants={itemV} className="text-center pt-4 border-t border-slate-800/50">
        <p className="text-[10px] text-slate-500">Full Balance v1.0.0 — 2026</p>
      </motion.div>
    </motion.div>
  );
}
