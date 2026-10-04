> **Güncel üretim hattı: [`studio3d/`](studio3d/README.md)** (onaylı 3D karakter + motion graphic şablonu, 250 hareket planı).
> Aşağıdaki SDF/raymarcher motoru (`engine/`, `goblet_squat.html`) eski denemedir; kullanıcı tarafından reddedildi.

# Full Balance antrenman videoları (3D, 9:16)

Uygulamadaki "YouTube'da izle" bağlantısının yerine geçecek, kodla üretilen 3D antrenman videoları.

## Araştırma (`research/`)
- `research/enumerate.mjs`: plan üreticiyi tüm hedef, ortam, seviye, gün, sağlık durumu ve odak bölgesi kombinasyonlarında çalıştırıp uygulamadaki hareketlerin tamamını çıkarır (390 benzersiz ad).
- `research/batches/`: kategorilere ayrılmış adlar.
- `research/specs/*.json`: 250 kanonik hareketin animasyona hazır teknik tarifi. Her biri eklem açıları, fazlar, tempo, nefes, temas noktaları, kamera açısı, ipuçları, sık hatalar, güvenlik notları ve kaynaklar içerir. Format: `research/SPEC_FORMAT.md`.

## Motor (`engine/`)
- `rig.js`: iskelet, iki kemikli IK, anatomik gövde tarifi (kapsül ve elipsoidler, kas grupları).
- `renderer.js`: WebGL2 SDF raymarcher: yumuşak gölge, AO, marka kenar ışıkları, kas vurgusu, hata için kırmızı uyarı, zemin işaretleri.

## Hareketler (`exercises/`)
- `goblet_squat.js`: poz modeli (derinlik `u` 0..1, hata parametreleri: `valgus`, `lean`, `drift`).
- `goblet_squat.html`: 31 sn'lik video kompozisyonu (kartlar, 3D açıklamalar, hata gösterimleri). Önizleme: `goblet_squat.html?play`.

## Render
```bash
npm install
node render.mjs goblet_squat.html                  # out/goblet_squat.mp4 (1080x1920, 30 fps)
node render.mjs goblet_squat.html --stills 5,11,20 # tek kare kontrolü
```

## 2D motion graphic hattı (`anim2d/`, pilot)

3D manken yerine düz renkli (flat vector) 2D karakter. Tek rig + tek video şablonu; her hareket yalnızca bir veri dosyası (`anim2d/data/<id>.json`, şema: `anim2d/DATA_FORMAT.md`).

- `anim2d/rig.js`: 2D iskelet, ileri kinematik, temas çözücüsü (Levenberg–Marquardt: el/ayak kaymaz, zemine girmez, eklem sınırları), zaman çizelgesi, saç ikincil hareketi.
- `anim2d/draw.js`: karakter, kas vurgusu, ekipman (dumbbell, barbell, kettlebell, mat, bench, band, top, kablo), zemin gölgesi.
- `anim2d/template.html`: 9:16 video şablonu (başlık, kas çipleri, faz kartları, nefes halkası, sayaç, ipucu balonları, yaygın hata / doğrusu, özet, imza). Önizleme: `anim2d/template.html?id=push_up&play`.

```bash
node anim2d/render.mjs goblet_squat            # out2d/goblet_squat.mp4 + out2d/contact/goblet_squat.png
node anim2d/render.mjs all --jobs 3            # tüm veri dosyaları (5 video ≈ 2,5 dk)
node anim2d/render.mjs push_up --stills 5,12   # tek kareler: out2d/stills/
node anim2d/tools/check.mjs all                # poz kalite kapısı: açılar, temas kayması
node anim2d/tools/spec2data.mjs romanian_deadlift   # spec'ten taslak veri dosyası (TODO_TR alanları elle/LLM ile)
```

Pilot: `goblet_squat` (ayakta, yan), `push_up` (yüzüstü plank), `glute_bridge` (sırtüstü), `bird_dog` (dört ayak), `warrior_2` (yoga, ön görünüm).
