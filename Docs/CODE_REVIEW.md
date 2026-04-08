# Arena Value Assessment Wizard — Full Code Review

Review date: 2026-04-02 (updated)  
Reviewer: Claude Code (claude-sonnet-4-6)  
Scope: All source files — Code.gs, Config.gs, SheetAudit.gs, Wizard.html, _script.html, _styles.html, Help.html, appsscript.json, and all Docs/

---

## Application Overview

A Google Apps Script (GAS) container-bound wizard that collects ROI/value assessment inputs and writes them to specific yellow input cells across three tabs of an Arena ROI Google Sheet. Deployed via clasp to a Sheets-bound GAS project.

**Deployment mechanism:** clasp push → GAS runs server-side; Wizard UI opens as a modal dialog inside Google Sheets.

---

## Architecture Summary

```
Google Sheets Menu
    └── Arena Value Wizard (onOpen)
        ├── Launch Wizard → showWizard() → modal dialog (920×700)
        ├── Clear All Inputs → clearAllInputs()
        └── Help / How It Works → showHelp() → modeless dialog (760×580)

Server-side (GAS)            Client-side (wizard dialog iframe)
─────────────────────        ──────────────────────────────────
Config.gs                    Wizard.html (HTML shell)
  └── getSheetConfig()          ├── _styles.html (CSS partial)
  └── getWizardConfig()         └── _script.html (JS state machine)

Code.gs
  ├── getCurrentValues()    ←── google.script.run on DOMContentLoaded
  ├── saveWizardData()      ←── google.script.run on submit
  └── clearAllInputs()

SheetAudit.gs               (run from Apps Script editor only)
  └── runSheetAudit()
```

### Template Injection Pattern

Config is passed from server to client at render time via GAS template interpolation in Wizard.html:

```html
<script>
  window.WIZ_CONFIG = <?!= JSON.stringify(getWizardConfig()); ?>;
</script>
```

This avoids a round-trip async call on load. `getCurrentValues()` is still async (loads existing sheet cell values), but config/schema is synchronous.

---

## File-by-File Analysis

### Config.gs

**Role:** Single source of truth for all cell mappings and field definitions.

**Structure:**
- `SPREADSHEET_TABS` — global constant with 3 tab names
- `getSheetConfig()` — returns the full config object (server use only)
- `getWizardConfig()` — strips down to only what the client needs (field defs, no write cols)

**Data Input fields (31 total, writeCol: 'E'):**

| Step | Fields | Rows |
|------|--------|------|
| 1 — Company Profile | customerName, annualRevenue, totalEmployees | E3, E4, E5 |
| 2 — Business Assumptions | revenueGrowthRate, revenueFromNewProducts, profitMarginNewProducts, npdCycleTime | E10, E11, E12, E15 |
| 3 — Cost Structure | cogsPercent, directMaterialPercent, cmMaterialPercent, inventoryValue, inventoryCarryingCost, expeditingCosts, scrapRework, warrantyService, excessObsolete | E18–E30 (with gaps) |
| 4 — Team Resources | 7 role pairs (FTEs + salary) + pdcWorkweekPercent | E34–E48 |

**Benefits Calc fields (18 total):**
- improvementCol: 'D' (stores decimal, e.g. 0.10 for 10%)
- includeCol: 'F' (stores "Yes" or "No" string)
- Steps 5/6/7 map to rows 2–19 (row 3 is intentionally blank/skipped)

**Legacy TCO fields (7 rows + onPrem toggle):**
- unitCostCol: 'C', qtyCol: 'D', includeCol: 'F'
- onPremCell: 'E3' (Yes/No string)
- Rows 5–11: legacySoftware, legacySoftwareSupport, legacyIntegrations, legacyInfrastructure, legacyMaintenance, legacyUpgrades, legacyOtherSubs

**storeAs logic (critical — this governs the wizard↔sheet conversion):**

| storeAs | Write to sheet | Read from sheet |
|---------|---------------|-----------------|
| text | String(value).trim() | as-is |
| number | parseFloat(value) | as-is |
| decimal | value / 100 (10% → 0.10) | value × 100 (0.10 → 10) |
| currency | parseFloat(strip non-numeric) | as-is |

**Notes:**
- Row gaps in Data Input are intentional — the sheet has header/label rows between sections
- `legacySoftwareSupport.qtyStoreAs: 'decimal'` — its qty is a percentage (e.g. 20 → 0.20 multiplier). The wizard UI treats it as "20%" but the sheet formula multiplies unitCost × 0.20.
- `npdCycleTime` uses storeAs: 'number' (not decimal) — stores raw week count

---

### Code.gs

**Role:** All server-side GAS entry points.

**Functions:**

`onOpen()` — Creates menu. Three items with two separators.

`showWizard()` — Renders Wizard.html via `createTemplateFromFile` (not `createHtmlOutputFromFile`) to enable `<?!= ?>` template syntax. Opens as **modal** dialog.

`showHelp()` — Opens Help.html as **modeless** dialog. Key distinction: modeless doesn't block the sheet, so users can reference it while working.

`include(filename)` — Used in Wizard.html to inject _styles.html and _script.html partials.

`getCurrentValues()` — Reads all three tabs. Returns flat object keyed by fieldId. Handles:
- Data Input: `result[field.id] = convertFromSheet(raw, field.storeAs)`
- Benefits Calc: improvement value + include toggle (`result[field.id + '_include']`)
- Legacy TCO: onPrem toggle + unitCost/qty/include per row
- Special case: treats "Mandatory" placeholder strings as empty (null)

`saveWizardData(formData)` — Validates first, then checks all three tabs exist before writing anything (pseudo-atomic: prevents partial writes if a tab is missing). Writes all three tabs, then calls `SpreadsheetApp.flush()`.

`toSheetValue(value, storeAs)` — Converts wizard display value to sheet storage value.

`convertFromSheet(raw, storeAs)` — Inverse of toSheetValue. Used in getCurrentValues.

`validateFormData(formData)` — Server-side validation. Returns array of error strings. Validates:
- Required fields (Data Input)
- Numeric range constraints (Data Input)  
- Benefit improvement ranges (Benefits Calc)
- Legacy TCO unit cost and qty non-negative

`clearAllInputs()` — Confirms with user, then clears all three tabs cell by cell.

**Observations:**
- The "atomic" write is not true atomic (no rollback if Benefits Calc write fails mid-loop) but the tab-existence check before any writes is a practical guard against the most common failure mode
- `convertFromSheet` handles edge cases well: empty string, null, undefined, "Mandatory" placeholder
- Error handling in `saveWizardData` wraps everything in try/catch, returns structured `{ success, errors }` response

---

### SheetAudit.gs

**Role:** Diagnostic tool run from the Apps Script editor to verify wizard-to-sheet alignment.

Checks all three tabs, logs `[OK]` or `[WARNING]` per cell. Warnings fire when a mapped input cell unexpectedly has a formula (meaning the wizard would overwrite it). Also checks that the Benefits Calc G column (calculated output) has a formula (as expected).

Returns `{ auditText, warningCount, warnings }` in addition to Logger.log output.

**Usage:** Tools → Run → `runSheetAudit` in the Apps Script editor.

---

### Wizard.html

HTML shell — minimal, ~50 lines. Key structure:
```html
<head>
  <!-- injects _styles.html -->
  <?!= include('_styles'); ?>
  <!-- injects WIZ_CONFIG from server -->
  <script>window.WIZ_CONFIG = <?!= JSON.stringify(getWizardConfig()); ?>;</script>
</head>
<body>
  <div class="wiz-header"> <!-- logo + tagline --> </div>
  <div id="stepIndicator"> <!-- step dots built by JS --> </div>
  <div id="wizBody"> <!-- step panels built by JS --> </div>
  <div class="wiz-footer"> <!-- back/next/submit buttons + progress text --> </div>
  <div id="spinnerOverlay"> <!-- loading state --> </div>
  <div id="toastContainer"> <!-- success/error toasts --> </div>
  <!-- injects _script.html -->
  <?!= include('_script'); ?>
</body>
```

---

### _script.html

**Role:** Full client-side wizard logic — ~1400+ lines. Uses an IIFE for scope isolation. No external libraries (pure vanilla JS, ES5 for GAS iframe compatibility).

**State:**
```javascript
var WIZARD = {
  currentStep: 1,
  totalSteps: 9,
  formData: {},         // input values (text, number, currency, slider)
  includeData: {},      // benefit include toggles
  currentStateData: {}, // today slider values (pre-Arena state)
  _netRefreshers: {},   // field.id → refreshNet() closure for net badge updates
  touchedSteps: {},     // step numbers the user has modified (dirty indicator)
  config: null,         // WIZ_CONFIG from server
  currentValues: {}     // values loaded from sheet on open
};
```

Note the split between `formData` (everything except benefit toggles) and `includeData` (benefit include toggles only). These are merged into a single payload at submit time.

**9-step flow:**

| Step | Renderer | UI Pattern |
|------|----------|-----------|
| 1 — Company Profile | renderStep1 | Text/number/currency inputs |
| 2 — Business Assumptions | renderStep2 | Slider fields |
| 3 — Cost Structure | renderStep3 | Mixed sliders + currency inputs with section dividers |
| 4 — Team Resources | renderStep4 | Table layout (role × FTE/salary), auto-fill defaults, live FTE total |
| 5 — Revenue & COGS Benefits | renderStep5/renderBenefitStep | Benefit sliders with maturity levels + include toggles |
| 6 — Productivity Benefits | renderStep6/renderBenefitStep | Same pattern |
| 7 — Cost Recovery Benefits | renderStep7/renderBenefitStep | Same pattern |
| 8 — Legacy System Costs | renderStep8 | Table with unit cost + qty + include toggle per row, live total |
| 9 — Review & Submit | renderStep9/populateReview | Summary grid of all entered values |

**Key mechanics:**

`buildBenefitSlider(field)` — The richest UI component. Builds:
- Slider with include toggle + value badge in header
- Low/high descriptive anchors
- Slider track with red→yellow→green gradient
- Maturity dots aligned to slider travel path (using `calc()` and % positioning)
- Maturity state description box (label + paragraph, animated on zone change)

### Dual Maturity Slider (Steps 5–7)

Each benefit slider card contains two sliders:
- **Current State (pre-Arena):** range 0–field.max, stored in `WIZARD.currentStateData[field.id]`. Not written to sheet.
- **Future State (with Arena):** range field.min–field.max, stored in `WIZARD.formData[field.id]`. Same maturity levels as before.
- **Delta:** `Math.max(0, future - current)` computed in `submitWizard()` and sent as the payload value for each benefit field. Written to Benefits Calc column D as a decimal.
- No cross-clamping: current and future sliders move independently. `Math.max(0, future - current)` handles cases where today > future gracefully (net = 0).
- On restore (loading from sheet): future state populated from saved delta, current state always resets to its `currentDefault`.
- Net badge registry: `WIZARD._netRefreshers[field.id]` holds each field's `refreshNet()` closure; `applyCurrentValues()` calls it after restoring a benefit value to update the net display.

`autoFillStep3Defaults()` — On step 3 entry, fills cost fields from revenue × percentage if empty. Never overwrites user data.

`autoFillStep4Defaults()` — On step 4 entry, fills FTE counts from totalEmployees × role default % if empty. Uses `FTE_DEFAULTS` map: devTeam=15%, cad=2%, engServices=1%, pdc=20%, quality=5%, compliance=2%, sourcing=1%.

`updateFTETotal()` — Keeps live "Total Arena Users" count and "X% of N employees" context note updated.

`updateLegacyTCOTotal()` — Computes live Legacy Annual TCO in step 8. For decimal qtyStoreAs rows, divides qty by 100 to get the multiplier.

`submitWizard()` — Merges formData + includeData, calls `google.script.run.saveWizardData(payload)`, shows spinner. On success: shows toast, closes dialog after 2s delay. On error: shows error toast with detail.

**Security model:**
- All DOM construction uses `createElement` + `textContent`
- No `innerHTML` with variable content anywhere
- Static structural HTML uses `make()` helper (creates element with className)
- Currency format on blur uses `toLocaleString` (safe, no injection surface)

**DOM utility functions:**
- `make(tag, className)` — creates element with class
- `clearEl(el)` — empties element via `while (el.firstChild) el.removeChild(el.firstChild)`
- `appendDivider(panel, text)` — adds section header row
- `indexById(fields)` — creates id→field lookup object
- `getFieldsByStep(stepNum, which)` — filters config fields by step number
- `clamp(val, min, max)` — numeric clamp utility
- `formatCurrency(n)` — formats number as $X,XXX

---

### _styles.html

CSS for the wizard dialog. CSS custom properties (variables) define the Arena brand palette:

```css
--arena-green:  #00890B  /* primary */
--arena-dark:   #004D07  /* header gradient start */
--arena-mid:    #007B0E  /* header gradient end */
--arena-light:  #40AA1D  /* active connectors */
--arena-tint:   #EAF7EB  /* backgrounds */
--ptc-orange:   #F47920  /* submit CTA only */
--text-dark:    #1A2A1A  /* note: slightly green-tinted, not pure #1A1A2E */
```

**Note:** `--ptc-blue` and `--ptc-light-blue` are defined as "kept for backwards compat" but unused in active styles.

Slider gradient: fixed red→yellow→green full-spectrum (not position-relative to value). This means the gradient always covers the full range regardless of thumb position — by design to show quality scale, not fill.

Maturity dots use `left: X%` relative to the `.maturity-dots` container, with a `calc()`-based offset for thumb radius alignment.

---

### Help.html

Standalone (self-contained) HTML/CSS/JS — does not use GAS template includes or the _styles partial. Has its own complete CSS block.

9 tabs:
1. Steps 1–4 (Company, Assumptions, Costs, Team)
2. Steps 5–7 (Benefits sliders)
3. Step 8 (Legacy TCO)
4. Data Flow (how wizard writes to sheet)
5–9: (additional content not read in full)

Opens as **modeless dialog** — non-blocking, stays open while user interacts with wizard.

---

### appsscript.json

```json
{
  "timeZone": "America/New_York",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.container.ui"
  ]
}
```

Two scopes only — minimal footprint. V8 runtime enables modern JS on server side (though the client code uses ES5 for compatibility).

---

## Data Flow (End to End)

```
1. User opens sheet → onOpen() → menu added

2. User clicks "Launch Wizard"
   → showWizard()
   → createTemplateFromFile('Wizard')
   → template renders: WIZ_CONFIG injected server-side
   → HTML dialog shown (modal, 920×700)

3. DOMContentLoaded fires in dialog
   → WIZARD.config = window.WIZ_CONFIG
   → buildUI() → step indicator + all 9 panels built
   → loadCurrentValues()
      → google.script.run.getCurrentValues()
         → reads E col (Data Input), D+F cols (Benefits Calc), C+D+F cols (Legacy TCO)
         → returns flat { fieldId: value } object
      → applyCurrentValues()
         → populates all inputs, sliders, toggles from sheet values

4. User navigates steps 1–9
   → Step 3 entry: autoFillStep3Defaults() (revenue-based cost estimates)
   → Step 4 entry: autoFillStep4Defaults() (employee%-based FTE estimates)
   → Step 9 entry: populateReview() (builds summary grid)
   → All values stored live in WIZARD.formData + WIZARD.includeData

5. User clicks "Save to Spreadsheet" (step 9)
   → submitWizard()
   → merges formData + includeData → payload
   → google.script.run.saveWizardData(payload)
      → validateFormData(payload) — server validates
      → checks all 3 tabs exist
      → writes Data Input (column E)
      → writes Benefits Calc (column D improvement, column F Yes/No)
      → writes Legacy TCO (column C unitCost, column D qty, column F include, E3 onPrem)
      → SpreadsheetApp.flush()
   → success: toast → dialog closes after 2s
   → error: toast with error message
```

---

## Spreadsheet Tab Mapping (Verified vs Config.gs)

| Tab | Write Columns | Notes |
|-----|--------------|-------|
| Data Input | E (writeCol: 'E') | 31 fields, rows 3–48 with gaps |
| Benefits Calc | D (improvement %), F (Yes/No include) | 18 fields, rows 2–19, row 3 skipped |
| Legacy TCO | C (unit cost), D (qty), F (include), E3 (on-prem toggle) | 7 rows (5–11) + E3 |

---

## Recent Feature Additions (2026-04-02)

### Free Navigation

Users can click any step indicator in the top progress bar to jump directly to that step (via `navigateTo()`). Previously, navigation was Next/Back only. Validation gating prevents skipping required steps without filling them.

### Dirty Step Indicator

An orange dot appears on the step indicator when the user has modified any field within that step. Tracked via `WIZARD.touchedSteps` (a set of step numbers). `markStepTouched(stepNum)` is called by delegated `input`/`change` listeners on each step's panel.

### Contextual Help System

Two levels of contextual help:

1. **Per-step `?` button** — Each step title is wrapped in a `.step-title-row` flex container. A small `?` circle button sits beside the title. Clicking it calls `google.script.run.showHelp(tabId)` which opens the Help dialog and deep-links to the matching tab via a GAS template scriptlet (`<?= initialTab ?>`).

2. **Per-field tooltip popovers** — Fields with a `hint` property get a small grey `?` circle next to their label. Clicking it toggles a `.field-tip-popover` (absolute positioned, 220px wide). `closeAllTips()` is called on document click to dismiss all open popovers. Shared helper `buildFieldTip(hintText, targetEl)` creates the tip button + popover structure.

`HELP_TAB_MAP` maps step numbers to Help.html tab IDs (e.g., step 5 → `'step5'`). `getHelpTab(step)` looks up the mapping.

### Today State Context (Current Maturity Levels)

Each benefit field in Config.gs now has three additional properties for the "Today (without Arena)" slider:

- `currentDefault` — initial slider position (0 for revenue/COGS fields, field.min for productivity/cost recovery)
- `currentLowAnchor` / `currentHighAnchor` — descriptive left/right labels for the today slider
- `currentMaturityLevels` — array of 3 `{ pct, label, description }` objects describing the current state at different slider positions

A maturity state box (`.maturity-state`) renders below the today slider, showing a label + description that updates as the user moves the slider. Uses the same `updateMaturityUI()` function via a wrapper object `{ maturityLevels: field.currentMaturityLevels, min: 0, max: field.max }`. No maturity dots are rendered for the today slider (a dummy `dotsEl` object is passed to satisfy the interface).

### Help.html Updates

Help.html now has **10 tabs**: Steps 1–9 plus a Data Flow reference tab. Step 8 is "Legacy TCO" (added), the old step 8 content was renumbered to step 9. All step badges read "Step N of 9". The `showHelp(tab)` function accepts an optional `tab` parameter for deep-linking from the wizard's `?` buttons.

---

## Known Issues & Discrepancies

### 1. Documentation is stale (multiple files)

**README.md** still shows the old 8-step structure. Step 8 is now "Legacy System Costs" and step 9 is "Review & Submit". The file structure table doesn't mention Help.html or SheetAudit.gs.

**SHEET_CONFIG.md** is significantly out of date:
- Says Data Input writes to column D — **actual is column E** (Config.gs line 30: `writeCol: 'E'`)
- Legacy TCO section describes old field IDs (`legacyLicenseCost`, `legacyITCost`, etc.) that were from the planning phase — the actual implementation uses `legacySoftware`, `legacySoftwareSupport`, etc. with unit-cost × qty structure
- Benefits Calc `reduceCMMaterial` default listed as 5% but Config.gs has `default: 3` (correct)

**LEGACY_TCO_ANALYSIS.md** is a planning document from before implementation. The actual implementation differs substantially from the proposed design:
- Proposed: single-value currency fields written to column D
- Actual: unit-cost × qty × include structure written to C/D/F
- Proposed: separate Arena investment costs section
- Actual: no Arena investment section in Legacy TCO wizard (may be handled elsewhere in sheet)

### 2. FTE storeAs ambiguity (unresolved from UI_AUDIT.md)

Seven FTE fields (`devTeamFTEs` E34, `cadFTEs` E36, `engServicesFTEs` E38, `pdcFTEs` E40, `qualityFTEs` E43, `complianceFTEs` E45, `sourcingFTEs` E47) are `storeAs: 'number'`. If the live sheet actually stores headcounts (e.g. 50), this is correct. If it stores decimal percentages (0.15), this needs to change to `storeAs: 'decimal'`.

**Resolution:** Check the live Google Sheet cells E34, E36, E38, E40, E43, E45, E47 in Data Input tab. Values between 0 and 1 = decimal storage → change to `storeAs: 'decimal'`. Values like 10, 25, 50 = headcount → current `storeAs: 'number'` is correct.

### 3. No true atomic write

`saveWizardData` checks all three tabs exist before writing, which prevents partial writes due to a missing tab. However, if the write to Data Input succeeds but an error occurs mid-write to Benefits Calc, there is no rollback — the sheet ends up in a partial state. In practice, GAS write failures mid-loop are rare (usually tab access issues are caught upfront), but this is worth noting.

### 4. Review step include data inconsistency

In `populateReview()` (line ~686), benefit field includes are read from `WIZARD.includeData[field.id + '_include']`, but Legacy TCO includes are read from `WIZARD.formData[tcoRow.id + '_include']`. These use different state stores. This works correctly because benefit includes were stored in `includeData` (via `buildIncludeToggle`) while Legacy TCO includes were stored in `formData` (via the Legacy TCO toggle handler). It's functionally correct but architecturally inconsistent.

### 5. Legacy TCO "qtyDefault: null" on legacySoftware row

`legacySoftware` (PLM License cost) has `qtyDefault: null`, meaning the qty (# of seats) has no auto-populated default. The other rows have defaults (20%, 1, 10%, 10%, 1, 1). This is intentional — seat count is customer-specific — but worth noting that this row requires the most manual entry.

---

## Capabilities Summary

The wizard collects and writes:

**Step 1 (Company Profile) → Data Input tab:**
- Customer name, annual revenue, total employee count

**Step 2 (Business Assumptions) → Data Input tab:**
- Revenue growth rate, % revenue from new products, profit margin on new products, NPD cycle time

**Step 3 (Cost Structure) → Data Input tab:**
- COGS %, direct material %, CM material %, inventory value, carrying cost %, expediting/scrap/warranty/E&O costs
- Auto-fills inventory (10% of revenue), expediting/scrap/warranty/E&O (0.2% each) on first visit

**Step 4 (Team Resources) → Data Input tab:**
- FTE count + avg salary for 7 roles: Development, CAD, Eng Services, Product Data Consumers, Quality, Compliance, Sourcing
- PDC % of workweek consuming product data
- Auto-fills FTE counts from employee % defaults on first visit
- Live "Total Arena Users" counter updates as FTEs are entered

**Steps 5–7 (Benefits) → Benefits Calc tab:**
- 18 improvement sliders (5-step maturity system with descriptions per level)
- Include/Exclude toggles per benefit
- Bulk Include All / Exclude All per step
- Stores as decimal (wizard: 10% → sheet: 0.10)

**Step 8 (Legacy TCO) → Legacy TCO tab:**
- On-premises/perpetual license toggle (E3)
- 7 cost line items, each with unit cost + qty + include toggle
- Live annual TCO total

**Step 9 (Review) → no write:**
- Summary of all entered values across all sections
- Submit button triggers server-side write

---

## Architecture Strengths

1. **Config as single source of truth** — no hardcoded cell references outside Config.gs
2. **Server-side validation mirrors client-side** — belt-and-suspenders approach
3. **DOM security** — no innerHTML with user data; all dynamic content via textContent
4. **Maturity level system** — rich UX without external libraries; descriptions guide users toward realistic inputs
5. **Auto-fill defaults** — step 3 and 4 defaults calculated from earlier inputs, never overwrite user data
6. **Partial load resilience** — `getCurrentValues()` returns null for empty/missing cells; wizard handles null gracefully throughout
7. **`SpreadsheetApp.flush()`** — forces immediate recalculation after write, ensuring downstream formulas update before the dialog confirms success

---

## Files Needing Updates

| File | Status | What needs updating |
|------|--------|---------------------|
| README.md | Stale | Step count (8→9), add Help menu, add SheetAudit.gs to file list |
| SHEET_CONFIG.md | Stale | Data Input column D→E, Legacy TCO section needs full rewrite to match actual implementation |
| LEGACY_TCO_ANALYSIS.md | Superseded | Mark as planning/archive doc; actual implementation differs |
| UI_AUDIT.md | Partially resolved | FTE storeAs still NEEDS-MANUAL-VERIFY; add Legacy TCO audit results |
