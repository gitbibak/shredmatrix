import { useMemo, useState } from 'react';
import { Activity, Calculator, Scale, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const copy = {
  en: {
    metric: 'Metric', imperial: 'Imperial', female: 'Female', male: 'Male', age: 'Age', height: 'Height', weight: 'Weight', feet: 'Feet', inches: 'Inches', activity: 'Activity', goal: 'Goal', calculate: 'Calculate', result: 'Your estimate', bmr: 'BMR', tdee: 'Maintenance', calories: 'Target calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', perDay: 'per day', save: 'Save this in my free plan', range: 'Suggested daily range', bmi: 'Your BMI', context: 'Adult screening category', underweight: 'Below standard range', healthy: 'Standard range', overweight: 'Above standard range', obesity: 'Well above standard range', note: 'This is an estimate, not a diagnosis or medical prescription.', activities: ['Mostly sedentary', 'Light activity (1-3 days/week)', 'Moderate activity (3-5 days/week)', 'High activity (6-7 days/week)', 'Very high activity'], goals: ['Maintain', 'Lose fat', 'Gain muscle'], errors: 'Enter valid values to calculate.'
  },
  es: {
    metric: 'Métrico', imperial: 'Imperial', female: 'Mujer', male: 'Hombre', age: 'Edad', height: 'Altura', weight: 'Peso', feet: 'Pies', inches: 'Pulgadas', activity: 'Actividad', goal: 'Objetivo', calculate: 'Calcular', result: 'Tu estimación', bmr: 'BMR', tdee: 'Mantenimiento', calories: 'Calorías objetivo', protein: 'Proteína', carbs: 'Carbohidratos', fat: 'Grasa', perDay: 'al día', save: 'Guardar en mi plan gratis', range: 'Rango diario sugerido', bmi: 'Tu IMC', context: 'Categoría orientativa para adultos', underweight: 'Por debajo del rango estándar', healthy: 'Rango estándar', overweight: 'Por encima del rango estándar', obesity: 'Muy por encima del rango estándar', note: 'Es una estimación, no un diagnóstico ni una prescripción médica.', activities: ['Principalmente sedentario', 'Actividad ligera (1-3 días/semana)', 'Actividad moderada (3-5 días/semana)', 'Actividad alta (6-7 días/semana)', 'Actividad muy alta'], goals: ['Mantener', 'Perder grasa', 'Ganar músculo'], errors: 'Introduce valores válidos para calcular.'
  },
};

const activityFactors = [1.2, 1.375, 1.55, 1.725, 1.9];
const goalAdjustments = [0, -0.15, 0.1];

function NumberField({ label, value, onChange, unit, min, max, step = 1 }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-400">{label}</span><div className="flex items-center rounded-xl border border-slate-700 bg-slate-950/75 focus-within:border-cyan-400"><input className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base font-bold text-white outline-none" type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} /><span className="pr-4 text-xs font-semibold text-slate-500">{unit}</span></div></label>;
}

export default function PublicHealthCalculator({ type, lang }) {
  const c = copy[lang] || copy.en;
  const [unit, setUnit] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [height, setHeight] = useState('175');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('9');
  const [weight, setWeight] = useState(unit === 'metric' ? '75' : '165');
  const [activity, setActivity] = useState('2');
  const [goal, setGoal] = useState('0');
  const [submitted, setSubmitted] = useState(false);

  const normalized = useMemo(() => {
    const kilograms = unit === 'metric' ? Number(weight) : Number(weight) * 0.45359237;
    const centimeters = unit === 'metric' ? Number(height) : ((Number(feet) * 12) + Number(inches)) * 2.54;
    return { kilograms, centimeters };
  }, [feet, height, inches, unit, weight]);

  const valid = normalized.kilograms >= 30 && normalized.kilograms <= 350 && normalized.centimeters >= 120 && normalized.centimeters <= 230 && Number(age) >= 18 && Number(age) <= 100;
  const bmi = valid ? normalized.kilograms / ((normalized.centimeters / 100) ** 2) : 0;
  const bmr = valid ? (10 * normalized.kilograms) + (6.25 * normalized.centimeters) - (5 * Number(age)) + (sex === 'male' ? 5 : -161) : 0;
  const tdee = bmr * activityFactors[Number(activity)];
  const targetCalories = tdee * (1 + goalAdjustments[Number(goal)]);
  const proteinFactor = type === 'protein' ? (Number(goal) === 2 ? [1.6, 2.2] : Number(goal) === 1 ? [1.6, 2.4] : [1.2, 1.8]) : [1.8, 1.8];
  const protein = normalized.kilograms * proteinFactor[0];
  const fat = normalized.kilograms * 0.8;
  const carbs = Math.max(0, (targetCalories - (protein * 4) - (fat * 9)) / 4);
  const bmiLabel = bmi < 18.5 ? c.underweight : bmi < 25 ? c.healthy : bmi < 30 ? c.overweight : c.obesity;

  function changeUnit(next) {
    if (next === unit) return;
    if (next === 'imperial') {
      setWeight(String(Math.round(Number(weight) * 2.20462)));
      const totalInches = Number(height) / 2.54;
      setFeet(String(Math.floor(totalInches / 12)));
      setInches(String(Math.round(totalInches % 12)));
    } else {
      setWeight(String(Math.round(Number(weight) * 0.453592)));
      setHeight(String(Math.round(((Number(feet) * 12) + Number(inches)) * 2.54)));
    }
    setUnit(next);
    setSubmitted(false);
  }

  const registerUrl = `/auth?mode=register&lang=${lang}&source=${type}-calculator`;

  return (
    <section className="border-y border-cyan-500/15 bg-slate-900/45 px-4 py-14">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-700/70 bg-slate-900 p-5 shadow-2xl shadow-black/20 sm:p-8">
        <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300"><Calculator size={22} /></span><div><p className="text-xs font-bold uppercase text-cyan-300">{c.result}</p><h2 className="font-outfit text-2xl font-extrabold text-white">{type === 'bmi' ? c.bmi : type === 'protein' ? c.protein : `${c.calories} & ${c.carbs}`}</h2></div></div>
        <div className="mb-6 inline-flex rounded-xl border border-slate-700 bg-slate-950 p-1">
          {['metric', 'imperial'].map((item) => <button key={item} type="button" onClick={() => changeUnit(item)} className={`rounded-lg px-4 py-2 text-xs font-bold ${unit === item ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>{c[item]}</button>)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {type !== 'bmi' && <NumberField label={c.age} value={age} onChange={setAge} unit="" min="18" max="100" />}
          {unit === 'metric' ? <NumberField label={c.height} value={height} onChange={setHeight} unit="cm" min="120" max="230" /> : <><NumberField label={c.feet} value={feet} onChange={setFeet} unit="ft" min="3" max="7" /><NumberField label={c.inches} value={inches} onChange={setInches} unit="in" min="0" max="11" /></>}
          <NumberField label={c.weight} value={weight} onChange={setWeight} unit={unit === 'metric' ? 'kg' : 'lb'} min="1" max="800" step="0.1" />
          {type !== 'bmi' && <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-400">{c.goal}</span><select value={goal} onChange={(event) => setGoal(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-400">{c.goals.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>}
          {type === 'calories' && <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-slate-400">{c.activity}</span><select value={activity} onChange={(event) => setActivity(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-400">{c.activities.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>}
          {type === 'protein' && <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-slate-400">{c.activity}</span><select value={activity} onChange={(event) => setActivity(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-400">{c.activities.slice(0, 4).map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>}
        </div>
        {type !== 'bmi' && <div className="mt-5 inline-flex rounded-xl border border-slate-700 bg-slate-950 p-1">{['female', 'male'].map((item) => <button key={item} type="button" onClick={() => setSex(item)} className={`rounded-lg px-4 py-2 text-xs font-bold ${sex === item ? 'bg-orange-500 text-white' : 'text-slate-400'}`}>{c[item]}</button>)}</div>}
        <button type="button" onClick={() => setSubmitted(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-cyan-500 px-5 py-4 font-outfit text-sm font-extrabold text-white"><Calculator size={17} />{c.calculate}</button>
        {submitted && !valid && <p className="mt-4 text-sm font-semibold text-red-300">{c.errors}</p>}
        {submitted && valid && <div className="mt-7 rounded-2xl border border-cyan-500/25 bg-slate-950/75 p-5">
          {type === 'bmi' ? <div className="grid gap-3 sm:grid-cols-2"><Result icon={Scale} label={c.bmi} value={bmi.toFixed(1)} /><Result icon={Activity} label={c.context} value={bmiLabel} compact /></div> : type === 'protein' ? <div className="grid gap-3 sm:grid-cols-2"><Result icon={Target} label={c.range} value={`${Math.round(normalized.kilograms * proteinFactor[0])}-${Math.round(normalized.kilograms * proteinFactor[1])} g`} /><Result icon={Scale} label={c.weight} value={`${Math.round(normalized.kilograms * 10) / 10} kg`} /></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Result icon={Activity} label={c.bmr} value={`${Math.round(bmr)} kcal`} /><Result icon={Target} label={c.tdee} value={`${Math.round(tdee)} kcal`} /><Result icon={Calculator} label={c.calories} value={`${Math.round(targetCalories)} kcal`} /><Result icon={Scale} label={c.protein} value={`${Math.round(protein)} g`} /><Result icon={Scale} label={c.carbs} value={`${Math.round(carbs)} g`} /><Result icon={Scale} label={c.fat} value={`${Math.round(fat)} g`} /></div>}
          <p className="mt-4 text-xs leading-relaxed text-slate-500">{c.note}</p>
          <Link to={registerUrl} className="mt-5 flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-slate-950">{c.save}</Link>
        </div>}
      </div>
    </section>
  );
}

function Result({ icon: Icon, label, value, compact = false }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Icon size={15} className="text-cyan-300" />{label}</div><p className={`mt-2 font-outfit font-extrabold text-white ${compact ? 'text-lg' : 'text-2xl'}`}>{value}</p></div>;
}

