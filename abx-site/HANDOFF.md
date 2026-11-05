# ABX Global — всё для работы без Claude

Здесь собрано всё по проекту: как запустить сайт, где что лежит, как менять тексты и варианты блоков, готовые тексты, промпты для картинок и список того, что ждём от клиента.

---

## 1. Запуск

Нужен только Python 3 (есть на любом Mac). Node.js 18+ нужен, только если правишь тексты или шаблон.

```bash
cd abx-site
python3 -m http.server 8123
```

| Адрес | Что открывается |
|---|---|
| http://localhost:8123/minimal/ | **основная рабочая версия** (minimal), чешский |
| http://localhost:8123/en/minimal/ | она же на английском |
| http://localhost:8123/ | старая полная версия, чешский |
| http://localhost:8123/en/ | старая полная версия, английский |

- Файл двойным кликом не открывать: пути к картинкам и стилям сломаются. Только через сервер.
- После правок обновлять страницу через **Cmd+Shift+R**.
- `?placeholders` в конце адреса подсвечивает все заглушки на странице.

Свежая версия кода всегда лежит в GitHub: репозиторий `alexeyluuu7-spec/case`, ветка `claude/friendly-mccarthy-rnmpib`.

```bash
git pull origin claude/friendly-mccarthy-rnmpib
```

---

## 2. Где что лежит

| Путь | Что это |
|---|---|
| `content/cs.json`, `content/en.json` | **все тексты сайта**; ключи в двух языках должны совпадать |
| `src/minimal.html` | шаблон minimal-версии: `{{ключ}}` подставляет текст, `{{=base}}` — путь |
| `src/index.html` | шаблон старой полной версии |
| `src/_sprite.html` | иконки (SVG-спрайт), в том числе шеврон `i-chev` для кнопок |
| `assets/css/minimal.css` | стили minimal-версии |
| `assets/css/site.css` | стили полной версии |
| `assets/js/site.js` | вся логика: переключатели вариантов, вкладки, слайдер, счётчики, тикающие цены |
| `assets/img/photos/` | фото болидов (track, cockpit, profile, silhouette, halo) в WebP 1000 и 2000 px |
| `assets/img/markets/` | рендеры для карточек рынков (бочка, датчик) |
| `tools/build.mjs` | сборка: из `src/` и `content/` делает готовые `index.html` |
| `tools/optimize-media.sh` | перегоняет картинки в WebP/AVIF и пережимает видео |
| `minimal/`, `en/`, `index.html` | **готовые собранные страницы**, их руками не править |
| `PLACEHOLDERS.md` | список заглушек для клиента |

---

## 3. Как поменять текст

1. Найди нужный текст в `content/cs.json` (и тот же ключ в `content/en.json`).
2. Поменяй значение в кавычках.
3. Пересобери страницы:

```bash
node tools/build.mjs
```

4. Обнови страницу в браузере.

Сборка остановится с ошибкой, если ключа нет в одном из языков или он используется в шаблоне, но не существует. Это защита от пустых мест на странице.

**Где какой ключ лежит:**

| Блок | Префикс ключей |
|---|---|
| Hero | `hero.*` |
| Цифры доверия | `trust.*`, `tr.*` |
| Рынки | `markets.*`, `mk.*`, `mk6.*` |
| Proč ABX | `why.*`, `wb.*`, `fee.*` |
| Платформа | `platform.*` |
| Безопасность | `sec.*`, `sec2.*` |
| Тарифы | `accounts.*`, `acc2.*`, `acc3.*`, `acc4.*` |
| Шаги | `steps.*`, `stp.*` |
| FAQ | `faq.*` |
| Финал | `final.*`, `fd.*`, `tk.*` |
| Общие (варианты, кнопки) | `min.*` |

---

## 4. Варианты блоков (переключатели A/B/C)

На minimal-странице у многих блоков есть переключатель вариантов. Какой вариант показывается по умолчанию, задаёт атрибут `data-v` в `src/minimal.html`.

| Блок | Варианты | По умолчанию |
|---|---|---|
| Hero | A — фото с болидом и промо-карточка; B — заголовок по центру и наклонный терминал; C — фото и плавающий тикет сделки | **A** |
| Цифры доверия | A — строка цифр; B — карточки с иллюстрациями; C — огромная «15+» и вехи | **B** |
| Список рынков | A — строки таблицы; B — карточки активов в ряд | **A** |
| Карточки рынков | A — слайдер; B — бенто; C — раскрывающиеся полосы; D — список и большая карточка | **B** |
| Proč ABX | A — четыре карточки с цифрами; B — бенто с тикетом спреда; C — бенто с чеком | **B** |
| Тарифы | колонки или веер карт со сравнением | **колонки** |
| Шаги | A — четыре карточки; B — список и телефон; C — прогресс-трек | **B** |
| Финал | A — фото и текст; B — фото и тикет сделки; C — карточки устройств | **A** |

**Как сменить вариант по умолчанию:** в `src/minimal.html` найди нужный блок по `data-vroot` и поменяй, например, `data-v="b"` на `data-v="c"`. Потом запусти `node tools/build.mjs`.

**Как убрать переключатель, когда вариант выбран:**
- удали `<div class="vsw" …>…</div>` этого блока;
- удали ненужные обёртки `<div class="v-a">`, `<div class="v-b">`, `<div class="v-c">` вместе с содержимым;
- `data-v` оставь на выбранном.

У «Списка рынков» и «Карточек рынков» варианты сделаны через CSS одной разметкой, там удаляется только `vsw`.

---

## 5. Сетка и размеры (для Figma)

- Десктоп: фрейм **1440**, поля **28**, контент **1384**, **12 колонок**, промежуток **16**.
- Планшет: 768, поля 18, 6 колонок. Мобила: 375, поля 16, контент 343.
- Брейкпоинты: 1100 (4 колонки → 2) и 680 (всё в одну колонку).
- Отступ между секциями: 160 на десктопе, 96 на мобиле. Между карточками везде 16.
- Скругления: панель 40, карточка 28, плашки 12–20, кнопки — пилюля. На мобиле 28 и 24.
- Шрифты: Geist 500, H1 80 / 44, H2 64 / 36, межбуквенный −4 %. Цифры — Geist Mono.

**Цвета:**

| Токен | Цвет |
|---|---|
| bg | `#0E0E0D` |
| panel | `#171716` |
| panel-2 | `#1F1F1D` |
| raised | `#2A2A27` |
| fg | `#F4F3F0` |
| fg-2 | `#9E9D97` |
| muted | `#85847E` |
| orange | `#FF711D` |
| up | `#4CC38A` |
| dn | `#E5484D` |

**Кнопки:** S — 36, M — 48, L — 68 по высоте; паддинг 16 / 24 / 32; Geist 500 16.

**Стрелка-шеврон** (24×24, заливка `#0E0E0D` на оранжевом):

```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0E0E0D"><path d="M0 5h6.5l7 7-7 7H0l7-7z"/><path d="M10 5h3.5l6.5 7-6.5 7H10l6.5-7z"/></svg>
```

---

## 6. Тексты

### Шапка блока рынков (стоит на сайте)

- **Метка:** TRHY
- **Заголовок:** Každý pohyb trhu / Je vaše příležitost
- **Подзаголовок:** Nvidia po výsledcích, ropa po zprávě z OPEC, SpaceX ještě před burzou. Více než 250 trhů a jeden účet, ze kterého je obchodujete.
- **Над карточками:** Vyberte si svou trať

### Карточки рынков, короткие (для Figma-макета)

Порядок по популярности: Forex → Akcie → Indexy → Komodity → второй план.

| Карточка | Описание |
|---|---|
| Forex | Největší trh světa, otevřený 24 hodin denně, 5 dní v týdnu. Hlavní i exotické páry se spready od 0,0 pipu. |
| Akcie | Tesla, Nvidia, Apple a další firmy, které hýbou světem. Reagujte na výsledky ještě týž den. |
| Indexy | Wall Street, Frankfurt nebo Tokio v jednom obchodu. Obchodujte směr celé ekonomiky bez výběru jednotlivých akcií. |
| Komodity | Zlato a stříbro pro časy krize. Ropa a plyn, které reagují na každou zprávu z OPEC. |
| Krypto *(если есть у ABX)* | Bitcoin a Ethereum bez peněženky a klíčů. Trh, který nikdy nezavírá. |
| ETF | Stovky firem nebo celé odvětví v jediné pozici. Nejjednodušší cesta, jak mít celý trh najednou. |
| Pre-IPO | SpaceX a Stripe ještě před vstupem na burzu. Přístup, který dosud měli jen velcí investoři. |

Кнопка на всех карточках — **Obchodovat**, на Pre-IPO — **Mám zájem**.

### Варианты оффера для hero (показать клиенту)

Заголовок клиента — «Obchodujte s nejlepšími ///». Варианты посильнее:

1. **SpaceX a Stripe. / Dřív, než půjdou na burzu ///** — Pre-IPO akcie, 250+ světových trhů a 5 % ročně z volné hotovosti. Vše na jednom účtu.
2. **Trhy jsou rychlé. / ABX je rychlejší ///** — Spready od 0,0 pipu, 250+ trhů a TradingView grafy v jedné platformě.
3. **Obchodujte s nejlepšími ///** — Akcie Tesly a Nvidie, ETF, zlato i pre-IPO SpaceX. Spready od 0,0 pipu, účet otevřete za pár minut. *(Заголовок клиента с конкретикой.)*
4. **Náskok začíná / přesností ///** *(ранний вариант самого клиента)*
5. **Vaše peníze pracují. / I když zrovna neobchodujete ///** — 5 % ročně z nevyužitého zůstatku, k tomu 250+ trhů a pre-IPO příležitosti. *(Рядом с процентами обязательны условия.)*

### Что чем является

| Пример | Категория |
|---|---|
| Apple, Tesla, Nvidia | Akcie (Stocks) |
| SpaceX, Stripe | Pre-IPO |
| EUR/USD, GBP/USD | Forex |
| US 500, Germany 40 | Indexy (Indices) |
| Gold, Brent, Natural gas | Komodity (Commodities) |
| SPY, GLD | ETF |
| Bitcoin, Ethereum | Krypto |

---

## 7. Промпты для картинок (GPT Image)

Общий стиль серии: тёмный полированный металл (gunmetal), чёрный фон, тёплый оранжевый свет — как отражение на металле, а не свечение. Поверхность гладкая, без штриховки.

### Indices — плитка S&P 500
Лучше генерировать плитку пустой и ставить текст в Figma: Geist 500, `#E8E6E1` с прозрачностью 85 %, лёгкий blur 0,5–1 px.

```
Close-up macro 3D product render, 1:1, dramatic diagonal composition. A single raised rounded square tile made of ribbed frosted glass with fine vertical grooves and realistic refraction, thin brushed dark-steel edge, a small matte orange metal tab on its top edge. The tile is tilted about 30 degrees and cropped by the right edge of the frame. Behind it, a perfectly regular grid of identical matte black rounded square tiles, all the same size, same spacing, lying flat on the same plane, aligned in straight rows, very dark brushed steel. Shallow depth of field: the front edge of the glass tile is sharp, the background tiles fall into soft blur. Low-key studio lighting, one soft warm light from the top left creating a single long highlight across the glass grooves, deep black shadows. The glass tile surface is completely blank, no text, no icons. No glow on the edges, no neon outline, no orange rim, no other colors except black, dark steel, clear glass and one small orange tab.
```

Если фон уезжает, кусок от «Behind it…» до «straight rows.» замени на: `Behind it, a plain very dark charcoal background with a soft gradient, and two more blank glass tiles hanging on thin black threads, out of focus.`

### Krypto — монета Bitcoin
Загрузить: 1) референс монеты, 2) логотип ₿.

```
Use image 1 as the reference for the coin shape, the tilted stacked composition and the camera angle. Use image 2 only as the reference for the exact Bitcoin "₿" symbol.

Recreate it as a premium dark 3D render: a stack of coins made of very dark gunmetal steel with a smooth satin finish and finely milled ridged edges. The top coin is tilted toward the camera like in image 1. Replace the "$10" with the Bitcoin "₿" symbol from image 2, deeply engraved into the coin face with crisp beveled edges, the same dark metal as the coin, no color fill.

Lighting: low-key studio, deep black background. One warm orange light from the side hits the coins, so half of the top coin glows with a natural molten orange-copper reflection on the metal and the other half falls into black shadow. The orange is a reflection of light on the metal surface, not a glow, not neon, not an outline.

Shallow depth of field, the lower coins of the stack fade into darkness. Sharp focus on the engraved symbol. Minimal, premium fintech, high detail, 1:1. No text, no numbers, no extra logos, no gold color, no neon glow, no light background, no brushed texture.
```

**Правка, если вышла штриховка** (загрузить результат обратно):

```
Edit this image. Keep the exact same composition, camera angle, coin stack, Bitcoin symbol, black background and the warm orange light from the right.

Change only the material: remove all brushed lines, scratches and streaky texture from the coin faces and the symbol. Make the metal perfectly smooth, like a dark gunmetal satin finish with a soft, even sheen, similar to polished anodized metal. The surface should look clean and uniform, with smooth soft gradients of light instead of lines.

Make the engraved Bitcoin symbol cleaner: smooth flat surfaces, crisp but softly rounded beveled edges catching a thin highlight. Keep the fine milled ridges only on the coin edges.

Keep the orange as a natural soft reflection of light on the smooth metal, not a glow, not neon. No texture, no brushed metal, no scratches, no noise, no grain.
```

### Krypto — Bitcoin в слотах
Загрузить: 1) референс с монетами в слотах (обрезать чужие надписи), 2) нашу монету Bitcoin.

```
Use image 1 only as a reference for the composition: a row of coins standing vertically in slots of rectangular metal blocks, one coin in the center raised higher than the others. Use image 2 as the reference for the coin material, the engraved Bitcoin "₿" symbol and the lighting style.

Create a new premium dark 3D render. A row of rectangular blocks made of very dark gunmetal steel with a smooth satin finish, each block with a narrow slot on top. In each slot a thick coin stands vertically, half hidden inside the block. The central coin is raised much higher, almost fully out of its slot, slightly turned toward the camera: it is the dark gunmetal coin from image 2 with the deeply engraved Bitcoin "₿" symbol and finely milled ridged edges. The other coins are the same dark metal, plain, without symbols, only their top halves visible above the blocks, gradually going out of focus toward the sides.

Lighting: low-key studio, deep black background. One warm orange light from the right creates a natural molten orange-copper reflection on the right half of the Bitcoin coin and on the edges of the neighboring coins and blocks, while the left sides fall into deep shadow. The orange is a reflection on metal, not a glow.

Shallow depth of field, sharp focus on the Bitcoin symbol, blocks in the foreground slightly blurred. Smooth satin metal, no brushed texture, no scratches, no grain. Minimal, premium fintech, high detail, 4:5. No text, no logos except the Bitcoin symbol, no colored coin faces, no blue, no neon glow, no light background.
```

### Komodity — слитки на подставке
Загрузить референс слитков (обрезать чужой текст снизу).

```
Use the attached image only as a reference for the composition: gold bars stacked on a square pedestal with a vertical ribbed panel behind them. Recreate it as a new premium dark 3D render.

Objects: three gold bars, one leaning on two stacked bars, with clean beveled edges. The bars are made of dark gold: a deep, almost bronze-black metal with a smooth satin finish, no engraving, no text, no stamps. They sit on a solid square pedestal made of very dark gunmetal steel with a smooth satin finish and slightly rounded edges. Behind them, a vertical ribbed panel of dark metal, softly out of focus.

Lighting: low-key studio, deep black background. One warm orange light from the upper right hits the scene, so the bars catch a natural molten orange-copper reflection on their top faces and edges, while their other sides fall into deep shadow. The light gently spreads and diffuses across the pedestal top, with a soft warm falloff and subtle reflections of the bars on its surface. The orange on the ribbed panel is a soft light gradient on the ridges.

Same style as a dark gunmetal coin series: smooth satin metal, no brushed texture, no scratches, no grain. Shallow depth of field, sharp focus on the front bar. Minimal, premium fintech, high detail, 1:1. No text, no numbers, no logos, no bright yellow gold, no neon glow, no light background.
```

**Правка, если слитки выглядят пластиком или медью:**

```
Edit this image. Keep the exact same composition, camera angle, bars, pedestal, ribbed background and the warm light from the upper right.

Make the gold bars darker and more realistic: a deep, rich dark gold, less orange and less copper, with a slightly muted tone. Increase the contrast on the bars: only the faces and edges facing the light catch a bright warm golden-orange highlight, while the faces turned away from the light fall into deep, almost black shadow. Avoid evenly lit surfaces. Add soft, realistic reflections and subtle gradients on each face, so the bars look like heavy polished metal, not plastic. Add a thin sharp specular highlight along the top edges of each bar.

Keep the pedestal and the ribbed panel as they are. Keep the reflections of the bars on the pedestal top, slightly darker. Smooth satin metal, no texture, no scratches, no grain. No neon glow, no bright yellow, no text.
```

### Akcie — ряд плиток с Apple
Загрузить референс с плитками.

```
Use the attached image as the reference for the composition: a long row of square tiles with rounded corners standing on their edges one behind another, receding to both sides, with one tile in the center raised higher than the others and showing the Apple logo.

Create a premium dark 3D render in the same composition. All tiles are made of polished dark gunmetal chrome with smooth liquid-looking surfaces, soft mirror reflections and gradients from deep black to grey. The raised central tile shows the Apple logo from the reference, deeply engraved into the metal, same dark chrome material, with crisp beveled edges catching a thin highlight. All other tiles are blank, dark chrome, no logos.

Lighting: low-key studio, deep black background. A warm orange-red light catches the thin edges and rounded corners of the tiles, creating thin glowing orange lines along the edges, a natural reflection of light, not a neon outline. One soft white highlight runs across the central tile. The tiles on both sides fade into darkness and soft blur.

Shallow depth of field, sharp focus on the central tile and the Apple logo. Minimal, premium, high detail, 16:9. Only black, dark chrome, grey highlights and thin orange edge light. No green, no white background, no other logos, no text, no glow haze.
```

### Веер металлических карт (тарифы или безопасность)
Загрузить: 1) карты Plasma (композиция), 2–4) референсы стиля (стекло с оранжевыми гранями, камеры).

```
Use image 1 as the reference for the composition: a fan of thin metal cards standing on their edges, fanned out in a row and receding into the dark, seen from a low angle. Use images 2, 3 and 4 as references for the material and lighting.

Create a premium dark 3D render. Five thin blank metal cards with rounded corners, fanned out like in image 1, the front card the largest and sharpest. Material: polished dark gunmetal chrome, like the camera body in images 3 and 4: smooth liquid-looking metal with soft mirror reflections and gradients from deep black to grey. The cards are completely blank, nothing printed or engraved on them.

Lighting: low-key studio, deep black background. A warm orange-red light catches the thin edges and rounded corners of the cards, creating thin glowing orange lines along the edges, like the glass edges in image 2, a natural reflection of light, not a neon outline. One soft white highlight runs diagonally across the front card. The cards in the back fade into darkness.

Shallow depth of field, sharp focus on the front card edge. Minimal, premium, high detail, 4:5. Only black, dark chrome, grey highlights and thin orange edge light. No text, no logos, no chip, no glow haze, no light background.
```

**Как вставлять картинки в карточки:**
- края картинки уводи в прозрачность градиентной маской, чтобы не было светлого прямоугольника на фоне карточки;
- на сайт клади WebP шириной 800 и 1254 px; перегнать можно скриптом `tools/optimize-media.sh` или любым конвертером.

---

## 8. Что подтвердить у клиента

Полный список с метками на странице — в `PLACEHOLDERS.md`. Главное:

- точное число инструментов: валютных пар, акций, индексов;
- **есть ли у ABX крипта** — в брифе её нет;
- спред «от 0,0», бонус 5 % / 3,25 %, вклад без комиссии (в чеке в Proč ABX C);
- рейтинг 4,8 на Trustpilot, цифры доверия (21 500+, 133+, €20k, 15+);
- годы и вехи в цифрах доверия C (2010 «Založení» и т. д.) — **придуманы как заглушка**;
- «Alokace jsou omezené» в Pre-IPO;
- имя менеджера «Martina» в чате (Proč ABX B и C);
- номер лицензии CySEC и юрлицо, процент CFD-риска;
- ссылки на App Store / Google Play и QR-код;
- SVG-логотипы: Tesla, Apple, Nvidia, SpaceX, партнёры, ABX, эмблема; награды.

## 9. Где minimal-версия расходится с брифом

Сделано сознательно, по стилю Plasma и traderise. Это стоит проговорить с клиентом.

| Что | В брифе | У нас |
|---|---|---|
| Кнопки | 5 px, «никаких пилюль» | пилюли |
| Скругления карточек | 6 px | 28–40 px |
| Шрифт заголовков | PP Formula Extrabold | Geist 500 |
| Ширина контейнера | 1680 | 1440 |
| Вторая строка заголовков | оранжевая | серая |

## 10. Проверено

- 375, 768, 1440, 1920: горизонтального скролла нет, ошибок в консоли нет.
- Lighthouse мобильный (последний замер до новых вариантов): Performance 86, Accessibility 97. После выбора вариантов прогнать заново:

```bash
npx lighthouse http://localhost:8123/minimal/ --form-factor=mobile --only-categories=performance,accessibility --view
```
