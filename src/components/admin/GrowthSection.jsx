import { AFFILIATE_CATALOG } from '../../data/affiliateProducts';
import { BarList, Delta, Metric, Panel, SegmentedControl, SkeletonRows, formatNumber, formatPercent } from './adminUi';

const PLACEMENT_LABELS = {
  seo_tr_dumbbell: 'TR dambıl sayfası',
  seo_tr_band: 'TR direnç bandı sayfası',
  seo_es_band: 'ES bant sayfası',
  app_home_basic: 'Uygulama içi · ev ekipmanı',
};
const productLabel = (id) => AFFILIATE_CATALOG.tr[id]?.label || id;

function AcquisitionTable({ rows, label, limit = 10, emptyText }) {
  const visible = rows.slice(0, limit);
  if (visible.length === 0) return <p className="py-3 text-sm text-slate-500">{emptyText}</p>;
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead className="text-xs text-slate-400">
          <tr>
            <th scope="col" className="px-1 pb-2 font-medium">{label}</th>
            <th scope="col" className="px-1 pb-2 text-right font-medium">Kayıt</th>
            <th scope="col" className="px-1 pb-2 text-right font-medium">Plan kuran</th>
            <th scope="col" className="px-1 pb-2 text-right font-medium">Oran</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {visible.map((row) => (
            <tr key={row.key}>
              <td className="max-w-[220px] truncate px-1 py-2 text-slate-200" title={row.label}>{row.label}</td>
              <td className="px-1 py-2 text-right tabular-nums font-semibold text-white">{formatNumber(row.registrations)}</td>
              <td className="px-1 py-2 text-right tabular-nums text-slate-300">{formatNumber(row.withPlan)}</td>
              <td className={`px-1 py-2 text-right tabular-nums ${row.planRate != null && row.planRate < 70 ? 'text-amber-300' : 'text-slate-300'}`}>{formatPercent(row.planRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > limit && <p className="mt-2 px-1 text-xs text-slate-500">+{rows.length - limit} satır daha (CSV için Kullanıcılar bölümü)</p>}
    </div>
  );
}

export default function GrowthSection({ metrics, period, onPeriodChange, loading }) {
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-slate-400">Tamamlanmış günler · İstanbul saati · yönetici hesapları hariç</p>
      <SegmentedControl label="Dönem" value={period} onChange={onPeriodChange} options={[[7, 'Son 7 gün'], [30, 'Son 30 gün']]} />
    </div>
  );

  if (!metrics) return <div className="space-y-4">{header}{loading && <Panel><SkeletonRows rows={8} /></Panel>}</div>;

  const { current, previous } = metrics.period;
  const { retention } = metrics;
  const funnelBase = current.funnel.opened;
  const funnelRows = [
    ['Uygulamayı açtı', current.funnel.opened],
    ['Bugün ekranını gördü', current.funnel.todayViewed],
    ['Antrenman planına baktı', current.funnel.planViewed],
    ['Antrenman gününü açtı', current.funnel.dayOpened],
    ['Antrenmanı tamamladı', current.funnel.completed],
  ].map(([label, value]) => ({ label, value, detail: funnelBase > 0 ? `%${Math.round((value / funnelBase) * 100)}` : null }));
  const usageRows = [
    ['Antrenman kaydı', current.workouts],
    ['Fotoğraf analizi', current.photos],
    ['Su kaydı', current.usage.water],
    ['Uyku kaydı', current.usage.sleep],
    ['Beslenme kaydı', current.usage.nutrition],
    ['Meditasyon', current.usage.meditation],
    ['Davet gönderimi', current.usage.invites],
    ['Antrenman modu başlatma', current.usage.sessionsStarted],
    ['Antrenman modu bitirme', current.usage.sessionsCompleted],
  ].map(([label, value]) => ({ label, value }));
  const toRows = (items) => items.map((item) => ({ ...item, key: item.label }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={`Yeni kayıt · ${period} gün`} value={formatNumber(current.registrations)} delta={<Delta value={current.registrations - previous.registrations} label={`önceki ${period} gün`} />} />
        <Metric label="Plan kurma oranı" value={formatPercent(current.planRate)} hint={`${formatNumber(current.withPlan)} / ${formatNumber(current.registrations)} yeni üye`} />
        <Metric label={`Aktif üye · ${period} gün`} value={formatNumber(current.active)} delta={<Delta value={current.active - previous.active} label={`önceki ${period} gün`} />} hint={`Eski üyelerden ${formatNumber(current.returning)}`} />
        <Metric
          label="Geri dönüş D1 / D7"
          value={`${formatPercent(retention.d1Rate)} / ${formatPercent(retention.d7Rate)}`}
          hint={`${formatNumber(retention.d1Returned)}/${formatNumber(retention.d1Eligible)} ve ${formatNumber(retention.d7Returned)}/${formatNumber(retention.d7Eligible)} ölçülebilen üye · son 60 gün`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Kaynaklar" description="İlk temas kaynağına göre kayıt ve plan kurma. Oran %70'in altındaysa sarı.">
          <AcquisitionTable rows={metrics.sources} label="Kaynak" emptyText="Bu dönemde kayıt yok." />
        </Panel>
        <Panel title="Giriş sayfaları" description="Kullanıcının siteye ilk girdiği sayfa">
          <AcquisitionTable rows={metrics.landings} label="Sayfa" emptyText="Giriş sayfası kaydı yok." />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Kullanım hunisi" description="Dönemde uygulamayı açan tekil üyeler; sıralı dönüşüm değildir.">
          <BarList rows={toRows(funnelRows)} color="bg-violet-500/25" />
        </Panel>
        <Panel title="Kullanım" description="Dönemdeki kayıt sayıları">
          <BarList rows={toRows(usageRows)} color="bg-emerald-500/20" />
        </Panel>
        <Panel title="Dil ve kampanya" description="Dönemdeki kayıtlar">
          <BarList rows={metrics.languages.map((row) => ({ ...row, value: row.registrations, detail: row.planRate == null ? null : `plan %${row.planRate}` }))} color="bg-sky-500/25" />
          {metrics.campaigns.length > 0 && (
            <div className="mt-4 border-t border-slate-800 pt-4">
              <p className="mb-2 text-xs font-medium text-slate-400">Kampanyalar</p>
              <BarList rows={metrics.campaigns.map((row) => ({ ...row, value: row.registrations }))} limit={6} />
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Ortaklık tıklamaları" description="Ekipman kutularındaki tıklamalar. Satış ve kazanç ortaklık programının panelinde görünür.">
        {current.affiliateClicks === 0
          ? <p className="py-2 text-sm text-slate-500">Bu dönemde tıklama yok. Ortaklık etiketi girildiğinde tıklamalar burada görünür.</p>
          : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="mb-2 text-xs font-medium text-slate-400">Yerleşim</p><BarList rows={toRows(metrics.affiliate.byPlacement.map((row) => ({ ...row, label: PLACEMENT_LABELS[row.label] || row.label })))} /></div>
              <div><p className="mb-2 text-xs font-medium text-slate-400">Ürün</p><BarList rows={toRows(metrics.affiliate.byProduct.map((row) => ({ ...row, label: productLabel(row.label) })))} /></div>
            </div>
          )}
      </Panel>

      <Panel title="Üye profili" description={`Planı olan ${formatNumber(metrics.totals.withPlan)} üye · tüm zamanlar`}>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ['Hedef', metrics.profileMix.goals],
            ['Seviye', metrics.profileMix.experiences],
            ['Ortam', metrics.profileMix.environments],
            ['Cinsiyet', metrics.profileMix.genders],
            ['Yaş', metrics.profileMix.ages],
          ].map(([title, rows]) => (
            <div key={title}>
              <p className="mb-2 text-xs font-medium text-slate-400">{title}</p>
              <BarList rows={toRows(rows)} color="bg-slate-500/25" emptyText="Veri yok." />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
