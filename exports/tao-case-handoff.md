# TAO.bot Behance case — handoff

## Setup
- Figma file: **Tao Case Behance**. Work happens through the figmosha bridge (repo `~/Desktop/Claude/figmosha2`).
- Start the bridge: `nohup bash start-bridge-mac.sh > /tmp/figmosha-bridge.log 2>&1 &`. Check it with `curl -s localhost:8787/status`.
- Run code: `./venv/bin/python figmosha.py exec --file x.js` (helpers `h.node`, `h.dumpTree`, `h.bF`…).
- Check visually by exporting a PNG of the node through the bridge (`exportAsync`), then look at the image.
- Rules: layer names in English only, spacing on a 4px grid, work on duplicates (don't touch the user's main frames without asking).

## Style tokens (product + case)
- Colors:
  - Background-Container `#071014`;
  - Accent -Blue-Black `#09161b` (tabs, toolbars);
  - Accent-Green-Dark `#0d1b20` (panels/cards);
  - Accent-Blue-Dark `#10272f` (strokes, active tab);
  - Accent-Green-Muted `#243f48` (tooltip stroke, chips);
  - Text-Light `#dcf4ff`;
  - Text-Light-Muted `#9eb1ba` (crosshair);
  - Text-Light-Faded `#698691`;
  - accent `#56E3FF`;
  - green `#51ca5a`, red `#ff5c5c`.
- These are library variables. Bind them with `h.bF` / `h.bS`; the variable objects can be found through nodes on Page 1.
- Shapes: panels radius 8 with 1px stroke `#10272f`; tab groups radius 6, pad 2; tabs radius 4; chips radius 3.
- Fonts: Inter (Medium / Semi Bold) for words; GT America Mono Trial (Rg / Md) for data and labels. Labels are mono UPPER.
- Icons: Lucide (lucide-static 0.454.0, stroke 1.75 at 16px) for trading icons, Phosphor elsewhere.
- Case accents: 32×2 accent tick, dashed grid lines `[2,4]`, `[01]` mono indexes.

## Current work — Page 3
- **`302:10674` "Explore / Subnet / Transactions · 1600"** — a duplicate of the user's screen `301:132274` (left = original, ref = `302:9508`).
  - Width 1600: left column 372 (SubnetsList), center 840, right column 372 (Info/Swap, Subnet info, Community sentiment).
  - **Chart `302:61423`** (840×548), rebuilt in our style:
    - toolbar: coin picker CACHEON · SN14 with the real icon, 1D/7D/1M/1Y, USD|TAO (USD active), Lucide chart-line / chart-candlestick, maximize;
    - O/H/L/C legend, area chart, last-price chip;
    - hover: crosshair, tooltip, axis chips;
    - volume bars.
    - Prices in USD scaled to Cacheon (~$2.42). The curve shape is illustrative.
  - **SubnetsList**: real SN3–SN23 from tao.bot (τ price, 24h %); the Cacheon row is highlighted.
  - Transactions table widened to 840 (columns 123/87/112×5/68).
  - **Next:**
    - the right column Subnet info still shows old ALPHA data — move it to Cacheon SN14 (real data on tao.bot/subnets/14);
    - optionally make the chart a component (Line/Candles × Default/Hover).

## Case structure (column `299:105443` "TAO · 01")
- Order: Intro → About+team → Client request (quote only) → Problem/Solution + Subnet page mockup on the gradient → 2 motion cards (badge states, subnet wheel with icons) → I·Explore → Swap states → Vault → Wallet → Product map / design system → mobile → closer.
- The numbers block was removed from the flow; the user may bring it back later.
- Draft blocks:
  - `297:71884` / `299:72411` — Numbers · Market scale with the subnet wheel;
  - `299:126187` — Explore laptop section (an Avon Chapter V style template).
- References: page "References · Full cases" (13 Behance cases; Rise, Avon and Lifemed include video frames). Notes are in memory `behance-references.md`.
- Data facts (tao.bot, Oct 2026): 128 subnets; TAO mcap $3.26B; subnet mcap $1.627B; FDV $5.89B. There are no public TAO.bot platform metrics (ask the client).
