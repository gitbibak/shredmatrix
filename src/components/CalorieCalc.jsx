import { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Calculator, Camera, CheckCircle2, ImagePlus, Lightbulb, LoaderCircle, Minus, Plus, RotateCcw, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import {
  analysisItemsToMealItems,
  analyzeMealPhoto,
  buildFoodVocabulary,
  getPhotoEstimateRange,
  prepareMealPhoto,
  rescaleMealItem,
  suggestHiddenIngredients,
} from '../lib/mealPhotoAnalysis';

// ═══════════════════════════════════════════════════════════
// 200+ foods database — per 100g values
// cal=calories, p=protein, c=carbs, f=fat
// ═══════════════════════════════════════════════════════════
import { FOODS } from '../data/foodDatabase';
export { FOODS } from '../data/foodDatabase';

const CATEGORIES = ['meat', 'dairy', 'grain', 'veggie', 'fruit', 'snack', 'drink', 'fastfood', 'dessert', 'sauce'];

export function getMealEstimateRange(calories, photoAssisted = false) {
  const value = Number(calories) || 0;
  if (value <= 0) return { low: 0, high: 0 };
  const lowerMultiplier = photoAssisted ? 0.8 : 0.9;
  const upperMultiplier = photoAssisted ? 1.3 : 1.15;
  return {
    low: Math.max(0, Math.round(value * lowerMultiplier)),
    high: Math.round(value * upperMultiplier),
  };
}

const MAX_MEAL_PHOTO_BYTES = 30 * 1024 * 1024;
const FOOD_VOCABULARY = buildFoodVocabulary(FOODS);

/** Portion step that feels natural for the current weight (5 g for garnish, 25 g for mains). */
export function portionStep(grams) {
  const value = Number(grams) || 0;
  if (value < 30) return 5;
  if (value < 100) return 10;
  return 25;
}

export function validateMealPhoto(file) {
  if (!file) return 'missing';
  const extension = file.name?.split('.').pop()?.toLowerCase();
  const supportedExtension = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(extension);
  if (file.type && !file.type.startsWith('image/')) return 'invalid';
  if (!file.type && !supportedExtension) return 'invalid';
  if (file.size > MAX_MEAL_PHOTO_BYTES) return 'tooLarge';
  return null;
}

export default function CalorieCalc({ language, embedded = false }) {
  const { t, lang } = useTranslation();
  const activeLang = language || lang;
  const tt = useCallback((key) => {
    if (!language) return t(key);
    const keys = key.split('.');
    let value = translations[activeLang];
    for (const part of keys) value = value?.[part];
    return value ?? t(key);
  }, [activeLang, language, t]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [grams, setGrams] = useState(100);
  const [selectedFood, setSelectedFood] = useState(null);
  const [mealItems, setMealItems] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [hiddenSuggestions, setHiddenSuggestions] = useState([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const photoRequestRef = useRef(0);

  const filtered = useMemo(() => {
    let items = FOODS;
    if (selectedCat) items = items.filter(f => f.cat === selectedCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(f => {
        // Search in all languages for better results
        return Object.values(f.name).some(n => n.toLowerCase().includes(q));
      });
    }
    return items;
  }, [search, selectedCat]);

  const calc = selectedFood ? {
    cal: Math.round((selectedFood.cal * grams) / 100),
    p: ((selectedFood.p * grams) / 100).toFixed(1),
    c: ((selectedFood.c * grams) / 100).toFixed(1),
    f: ((selectedFood.f * grams) / 100).toFixed(1),
  } : null;

  const totals = useMemo(() => mealItems.reduce((sum, item) => ({
    cal: sum.cal + item.cal,
    p: sum.p + item.p,
    c: sum.c + item.c,
    f: sum.f + item.f,
  }), { cal: 0, p: 0, c: 0, f: 0 }), [mealItems]);
  const estimateRange = useMemo(() => (
    photo && analysisMeta
      ? getPhotoEstimateRange(totals.cal, analysisMeta.confidence, hiddenSuggestions.filter((entry) => !entry.added).length)
      : getMealEstimateRange(totals.cal, Boolean(photo))
  ), [analysisMeta, hiddenSuggestions, photo, totals.cal]);
  const manualPanelVisible = !photo || showManualAdd;

  const updateItemGrams = (id, delta) => {
    setMealItems((items) => items.map((item) => (
      item.id === id ? rescaleMealItem(item, item.grams + delta) : item
    )));
  };

  const addHiddenSuggestion = (index) => {
    const suggestion = hiddenSuggestions[index];
    if (!suggestion?.food || suggestion.added) return;
    const multiplier = suggestion.grams / 100;
    setMealItems((items) => [...items, {
      id: `hidden-${Date.now()}-${index}`,
      source: 'hidden',
      food: suggestion.food,
      grams: suggestion.grams,
      cal: Math.round(suggestion.food.cal * multiplier),
      p: suggestion.food.p * multiplier,
      c: suggestion.food.c * multiplier,
      f: suggestion.food.f * multiplier,
    }]);
    setHiddenSuggestions((entries) => entries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, added: true } : entry)));
    trackEvent('meal_hidden_ingredient_added', { surface: language ? 'public_tool' : 'dashboard', category: suggestion.food.cat, language: activeLang });
  };

  const selectPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const validationError = validateMealPhoto(file);
    if (validationError) {
      setPhotoError(tt(`calorieCalc.photoError${validationError === 'tooLarge' ? 'TooLarge' : 'Invalid'}`));
      return;
    }

    const requestId = ++photoRequestRef.current;
    setPhotoError('');
    setPhotoLoading(true);
    setAnalysisMeta(null);
    setHiddenSuggestions([]);
    setShowManualAdd(false);
    setMealItems((items) => items.filter((item) => item.source !== 'photo' && item.source !== 'hidden'));
    try {
      const image = await prepareMealPhoto(file);
      if (requestId !== photoRequestRef.current) return;
      setPhoto({ url: image, name: file.name });
      setPhotoLoading(false);
      setPhotoAnalyzing(true);
      trackEvent('meal_photo_started', { surface: language ? 'public_tool' : 'dashboard', language: activeLang });
      const analysis = await analyzeMealPhoto(image, activeLang, fetch, FOOD_VOCABULARY);
      if (requestId !== photoRequestRef.current) return;
      if (!analysis.isFood || !Array.isArray(analysis.items) || analysis.items.length === 0) {
        setPhotoError(tt('calorieCalc.photoErrorNoFood'));
        trackEvent('meal_photo_analysis_failed', { reason: 'no_food', language: activeLang });
        return;
      }
      const analyzedItems = analysisItemsToMealItems(analysis.items, activeLang, FOODS);
      if (analyzedItems.length === 0) throw new Error('invalid_analysis');
      const suggestions = suggestHiddenIngredients(analysis.hiddenIngredients, FOODS)
        .filter((entry) => !analyzedItems.some((item) => item.food.name.en === entry.food?.name.en));
      setMealItems((items) => [...items.filter((item) => item.source !== 'photo'), ...analyzedItems]);
      setAnalysisMeta({ confidence: Number(analysis.confidence) || 0.5, model: analysis.model || '' });
      setHiddenSuggestions(suggestions);
      trackEvent('meal_photo_analyzed', {
        language: activeLang,
        item_count: analysis.items.length,
        matched_count: analyzedItems.filter((item) => item.matched).length,
        hidden_count: suggestions.length,
        confidence: Math.round((Number(analysis.confidence) || 0) * 100),
      });
    } catch (error) {
      if (requestId !== photoRequestRef.current) return;
      const readFailure = ['image_read_failed', 'image_decode_failed'].includes(error?.message);
      setPhotoError(tt(readFailure ? 'calorieCalc.photoErrorRead' : 'calorieCalc.photoErrorAnalysis'));
      trackEvent('meal_photo_analysis_failed', { reason: readFailure ? 'read' : 'service', language: activeLang });
    } finally {
      if (requestId === photoRequestRef.current) {
        setPhotoLoading(false);
        setPhotoAnalyzing(false);
      }
    }
  };

  const removePhoto = () => {
    photoRequestRef.current += 1;
    setPhotoLoading(false);
    setPhotoAnalyzing(false);
    setPhoto(null);
    setPhotoError('');
    setAnalysisMeta(null);
    setHiddenSuggestions([]);
    setShowManualAdd(false);
    setMealItems((items) => items.filter((item) => item.source !== 'photo' && item.source !== 'hidden'));
  };

  const addToMeal = () => {
    if (!selectedFood || grams < 1) return;
    const multiplier = grams / 100;
    setMealItems(items => [...items, {
      id: `${Date.now()}-${items.length}`,
      food: selectedFood,
      grams,
      cal: Math.round(selectedFood.cal * multiplier),
      p: selectedFood.p * multiplier,
      c: selectedFood.c * multiplier,
      f: selectedFood.f * multiplier,
    }]);
    setSelectedFood(null);
    setGrams(100);
    setSearch('');
    trackEvent('meal_item_added', { surface: language ? 'public_tool' : 'dashboard', category: selectedFood.cat, language: activeLang });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={embedded ? '' : 'rounded-2xl border border-slate-800 bg-slate-900 p-5'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold font-outfit text-white">{tt('calorieCalc.title')}</h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {FOODS.length}+
          </span>
        </div>
      </div>
      <p className="mb-4 text-[10px] leading-relaxed text-slate-500">{tt('calorieCalc.helper')}</p>

      <div className="mb-4 overflow-hidden rounded-xl border border-cyan-500/25 bg-cyan-500/5">
        {photo ? (
          <div className="relative aspect-[16/9] w-full bg-slate-950">
            <img
              src={photo.url}
              alt={tt('calorieCalc.photoAlt')}
              className="h-full w-full object-contain"
              onError={() => {
                setPhoto(null);
                setPhotoError(tt('calorieCalc.photoErrorRead'));
              }}
            />
            <button type="button" onClick={removePhoto} aria-label={tt('calorieCalc.removePhoto')} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-slate-950/85 text-white backdrop-blur">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300"><Camera size={21} /></span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-white">{tt('calorieCalc.photoStart')}</span>
                <span className="mt-1 block text-[10px] leading-relaxed text-slate-400">{tt('calorieCalc.photoHelper')}</span>
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" disabled={photoLoading || photoAnalyzing} onClick={() => cameraInputRef.current?.click()} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 text-[11px] font-bold text-cyan-200 disabled:opacity-60">
                <Camera size={16} /> {tt('calorieCalc.photoTake')}
              </button>
              <button type="button" disabled={photoLoading || photoAnalyzing} onClick={() => galleryInputRef.current?.click()} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-[11px] font-bold text-slate-200 disabled:opacity-60">
                <ImagePlus size={16} /> {tt('calorieCalc.photoChoose')}
              </button>
            </div>
            {photoLoading && <p className="mt-2 text-[10px] text-cyan-200">{tt('calorieCalc.photoLoading')}</p>}
          </div>
        )}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={selectPhoto} className="hidden" aria-label={tt('calorieCalc.photoTake')} />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={selectPhoto} className="hidden" aria-label={tt('calorieCalc.photoChoose')} />
        <div className="flex items-start gap-2 border-t border-cyan-500/15 px-4 py-3 text-[10px] leading-relaxed text-cyan-100/75">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
          <span>{tt('calorieCalc.photoPrivacy')}</span>
        </div>
      </div>

      {photoError && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-[10px] leading-relaxed text-red-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{photoError}</span>
        </div>
      )}

      {photoAnalyzing && (
        <div role="status" className="mb-4 flex items-center gap-3 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3 text-cyan-100">
          <LoaderCircle size={18} className="shrink-0 animate-spin text-cyan-300" />
          <div>
            <p className="text-xs font-bold">{tt('calorieCalc.photoAnalyzing')}</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-cyan-100/65">{tt('calorieCalc.photoAnalyzingHelper')}</p>
          </div>
        </div>
      )}

      {photo && !photoAnalyzing && mealItems.some((item) => item.source === 'photo') && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-emerald-200">{tt('calorieCalc.photoAnalysisReady')}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{tt('calorieCalc.photoAnalysisReadyHelper')}</p>
          </div>
        </div>
      )}

      {photo && !photoAnalyzing && hiddenSuggestions.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <div>
              <p className="text-xs font-bold text-amber-100">{tt('calorieCalc.possibleHidden')}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{tt('calorieCalc.hiddenHelper')}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hiddenSuggestions.map((suggestion, index) => {
              const label = suggestion.food ? (suggestion.food.name[activeLang] || suggestion.food.name.en) : suggestion.label;
              const interactive = Boolean(suggestion.food) && !suggestion.added;
              return (
                <button
                  key={`${label}-${index}`}
                  type="button"
                  disabled={!interactive}
                  onClick={() => addHiddenSuggestion(index)}
                  className={`flex min-h-9 items-center gap-1 rounded-lg border px-2.5 text-[10px] font-semibold transition-colors ${suggestion.added ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : suggestion.food ? 'border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20' : 'border-slate-700 bg-slate-950/60 text-slate-500'}`}
                >
                  {suggestion.added ? <CheckCircle2 size={12} /> : suggestion.food ? <Plus size={12} /> : null}
                  {label}{suggestion.food && !suggestion.added ? ` · ${suggestion.grams}g` : ''}{suggestion.added ? ` · ${tt('calorieCalc.hiddenAdded')}` : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {photo && !photoAnalyzing && !showManualAdd && (
        <button type="button" onClick={() => setShowManualAdd(true)} className="mb-4 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 text-[11px] font-semibold text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300">
          <Plus size={14} /> {tt('calorieCalc.addMoreFood')}
        </button>
      )}

      {/* Search */}
      {manualPanelVisible && <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text" placeholder={tt('calorieCalc.search')}
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 transition-colors"
        />
      </div>}

      {/* Category filter */}
      {manualPanelVisible && <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => setSelectedCat(null)}
          className={`px-2 py-0.5 rounded-lg text-[9px] font-medium cursor-pointer transition-all ${!selectedCat ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-white'}`}
        >
          {t('progressPeriod.all')}
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setSelectedCat(cat === selectedCat ? null : cat)}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-medium cursor-pointer transition-all ${selectedCat === cat ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-white'}`}
          >
            {tt(`calorieCalc.categories.${cat}`)}
          </button>
        ))}
      </div>}

      {/* Food list */}
      {manualPanelVisible && <div className="max-h-48 overflow-y-auto scrollbar-none space-y-1 mb-4">
        {filtered.map((food, i) => {
          const name = food.name[activeLang] || food.name.tr;
          const isSelected = selectedFood === food;
          return (
            <button
              key={i} onClick={() => { setSelectedFood(food); setGrams(100); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-emerald-500/15 border border-emerald-500/30 text-white' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'}`}
            >
              <span className="font-medium truncate mr-2">{name}</span>
              <span className="text-slate-500 shrink-0">{food.cal} kcal</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-600 py-4">—</p>
        )}
      </div>}

      {/* Gram input + Result */}
      <AnimatePresence>
        {selectedFood && manualPanelVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <label className="text-[10px] text-slate-500 shrink-0">{tt('calorieCalc.grams')}:</label>
              <input
                type="number" min="1" max="2000" step="10" value={grams}
                onChange={e => setGrams(parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm text-white text-center focus:border-emerald-500/50 transition-colors"
              />
              <span className="text-[10px] text-slate-500">g</span>
              <span className="min-w-0 flex-1 truncate text-right text-[10px] text-emerald-400 font-semibold">
                {selectedFood.name[activeLang] || selectedFood.name.tr}
              </span>
              <div className="flex w-full gap-1 overflow-x-auto pb-0.5">
                {[50, 100, 150, 200, 250].map((portion) => (
                  <button key={portion} type="button" onClick={() => setGrams(portion)} className={`min-h-8 min-w-12 rounded-lg border px-2 text-[10px] font-semibold ${grams === portion ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-500'}`}>
                    {portion}g
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={addToMeal}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                <Plus size={14} /> {tt('calorieCalc.add')}
              </button>
            </div>

            {calc && (
              <div className="grid grid-cols-4 gap-1.5">
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{tt('calorieCalc.cal')}</p>
                  <p className="text-sm font-bold text-white font-outfit">{calc.cal}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{tt('calorieCalc.protein')}</p>
                  <p className="text-sm font-bold text-orange-400 font-outfit">{calc.p}g</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{tt('calorieCalc.carbs')}</p>
                  <p className="text-sm font-bold text-blue-400 font-outfit">{calc.c}g</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{tt('calorieCalc.fat')}</p>
                  <p className="text-sm font-bold text-purple-400 font-outfit">{calc.f}g</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {mealItems.length > 0 && (
        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold text-white">{tt('calorieCalc.mealTotal')}</h4>
            <button type="button" onClick={() => setMealItems([])} className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-red-400">
              <RotateCcw size={12} /> {tt('calorieCalc.clear')}
            </button>
          </div>
          <div className="mb-3 space-y-1.5">
            {mealItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 rounded-lg bg-slate-950/70 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs text-slate-300">{item.food.name[activeLang] || item.food.name.tr}</span>
                  {item.source === 'photo' && item.portion && <span className="mt-0.5 block truncate text-[9px] text-cyan-200/55">{item.portion}</span>}
                  {item.source === 'photo' && item.matched === false && <span className="mt-0.5 block truncate text-[9px] text-amber-200/60">{tt('calorieCalc.unmatchedHint')}</span>}
                </span>
                <span className="flex items-center gap-0.5">
                  <button type="button" aria-label={tt('calorieCalc.decreasePortion')} onClick={() => updateItemGrams(item.id, -portionStep(item.grams))} className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white">
                    <Minus size={11} />
                  </button>
                  <span className="w-11 text-center text-[10px] tabular-nums text-slate-300">{Math.round(item.grams)}g</span>
                  <button type="button" aria-label={tt('calorieCalc.increasePortion')} onClick={() => updateItemGrams(item.id, portionStep(item.grams))} className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white">
                    <Plus size={11} />
                  </button>
                </span>
                <span className="w-14 text-right text-[10px] font-semibold text-white">{item.cal} kcal</span>
                <button type="button" aria-label={tt('calorieCalc.remove')} onClick={() => setMealItems(items => items.filter(entry => entry.id !== item.id))} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              [tt('calorieCalc.cal'), Math.round(totals.cal), 'text-white', ''],
              [tt('calorieCalc.protein'), totals.p.toFixed(1), 'text-orange-400', 'g'],
              [tt('calorieCalc.carbs'), totals.c.toFixed(1), 'text-blue-400', 'g'],
              [tt('calorieCalc.fat'), totals.f.toFixed(1), 'text-purple-400', 'g'],
            ].map(([label, value, color, unit]) => (
              <div key={label} className="rounded-xl border border-slate-800/50 bg-slate-950/60 p-2 text-center">
                <p className="text-[8px] text-slate-500">{label}</p>
                <p className={`text-sm font-bold font-outfit ${color}`}>{value}{unit}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
            <div>
              <p className="text-[10px] font-bold text-amber-200">{tt('calorieCalc.estimateRange')}: {estimateRange.low}-{estimateRange.high} kcal</p>
              <p className="mt-1 text-[9px] leading-relaxed text-slate-500">{tt('calorieCalc.estimateHelper')}</p>
            </div>
          </div>
          <button type="button" onClick={() => {
            trackEvent('nutrition_logged', {
              source: language ? 'public_tool' : 'dashboard',
              photoAssisted: Boolean(photo),
            });
          }} className="mt-3 min-h-11 w-full rounded-xl bg-emerald-500 px-4 text-xs font-bold text-slate-950 hover:bg-emerald-400">
            {tt('calorieCalc.confirmEstimate')}
          </button>
          <p className="mt-2 text-[9px] leading-relaxed text-slate-600">{tt('calorieCalc.disclaimer')}</p>
        </div>
      )}
    </motion.div>
  );
}
