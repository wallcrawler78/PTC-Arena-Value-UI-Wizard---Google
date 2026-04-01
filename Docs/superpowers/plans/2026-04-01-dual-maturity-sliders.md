# Dual Maturity Sliders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace each single benefit slider with a dual-slider (Current State / Future State) so the wizard calculates the incremental delta a customer gains by adopting Arena, rather than their absolute future-state improvement.

**Architecture:** Add `WIZARD.currentStateData` for pre-Arena baseline values. Refactor `buildBenefitSlider` into a dual-slider card. Compute `delta = max(0, future - current)` in `submitWizard` before sending to the server. Relax server-side benefit validation to accept deltas in the range `[0, field.max]` instead of `[field.min, field.max]`. No spreadsheet schema changes — the delta is written to the existing Benefits Calc column D.

**Tech Stack:** Google Apps Script (GAS), vanilla ES5 JavaScript (GAS iframe constraint), CSS custom properties, clasp for deploy.

---

## Background: How Benefit Sliders Work Today

Each of the 18 benefit fields (steps 5-7) has:
- A single slider (`field.min` → `field.max`, storeAs `decimal`)
- Four maturity level objects (`{ pct, label, description }`) — Arena-specific descriptions
- The slider value is stored in `WIZARD.formData[field.id]` and written directly to Benefits Calc column D (as a decimal, e.g. 10 → 0.10)

After this feature:
- **Current State slider** — "What improvement does your existing system give you today?" Range: `0` → `field.max`. Stored in `WIZARD.currentStateData[field.id]`. Not written to sheet.
- **Future State slider** — "Where will you be with Arena?" Range: `field.min` → `field.max`. Same maturity levels and descriptions as today. Stored in `WIZARD.formData[field.id]`.
- **Net delta** — `Math.max(0, future - current)`. This is what gets written to the sheet.
- Current state is constrained to never exceed future state (hard clamp).

---

## Files Changed

| File | Change |
|------|--------|
| `_script.html` | Add `currentStateData` to WIZARD state; refactor `buildBenefitSlider`; update `submitWizard`; update `populateReview`; update `applyCurrentValues` |
| `_styles.html` | Add CSS for dual-slider card layout, current-state section, net badge |
| `Code.gs` | Relax `validateFormData` benefit range check from `[field.min, field.max]` to `[0, field.max]` |
| `Docs/CODE_REVIEW.md` | Add dual-maturity section |

---

## Task 1: Add `currentStateData` to WIZARD state

**File:** `_script.html` — WIZARD object at top of IIFE (~line 6)

- [ ] **Step 1.1 — Add the new state store**

  Find the WIZARD object (lines 6–13). Add `currentStateData: {}` after `includeData`:

  ```javascript
  var WIZARD = {
    currentStep: 1,
    totalSteps: 9,
    formData: {},
    includeData: {},
    currentStateData: {},   // ← ADD THIS LINE
    config: null,
    currentValues: {}
  };
  ```

- [ ] **Step 1.2 — Update `submitWizard` to compute and send deltas**

  Find `submitWizard()` (~line 1306). Replace the payload-building block:

  **Before:**
  ```javascript
  function submitWizard() {
    var payload = {};
    Object.keys(WIZARD.formData).forEach(function(k) { payload[k] = WIZARD.formData[k]; });
    Object.keys(WIZARD.includeData).forEach(function(k) { payload[k] = WIZARD.includeData[k]; });
  ```

  **After:**
  ```javascript
  function submitWizard() {
    var payload = {};
    Object.keys(WIZARD.formData).forEach(function(k) { payload[k] = WIZARD.formData[k]; });
    Object.keys(WIZARD.includeData).forEach(function(k) { payload[k] = WIZARD.includeData[k]; });

    // Overwrite benefit fields with the delta (future - current baseline)
    (WIZARD.config.benefitsFields || []).forEach(function(field) {
      var future  = parseFloat(WIZARD.formData[field.id]) || 0;
      var current = parseFloat(WIZARD.currentStateData[field.id]) || 0;
      payload[field.id] = Math.max(0, future - current);
    });
  ```

- [ ] **Step 1.3 — Deploy and smoke-test**

  ```bash
  clasp push
  ```

  Open wizard, navigate to step 5, move a future slider to 20%, submit. Check the Benefits Calc sheet cell — it should still write the value correctly (delta = 20 since current defaults to 0). Nothing should be broken yet.

- [ ] **Step 1.4 — Commit**

  ```bash
  git add _script.html
  git commit -m "feat: add currentStateData store and delta computation in submitWizard"
  ```

---

## Task 2: Relax server-side benefit validation

**File:** `Code.gs` — `validateFormData()` (~line 269)

The delta can be any value from `0` to `field.max`. The old check `num < field.min` would reject valid small deltas (e.g., future=12, current=10 → delta=2, below `field.min` of 10).

- [ ] **Step 2.1 — Update benefit range check**

  Find the `config.benefitsCalc.fields.forEach` block in `validateFormData`:

  **Before:**
  ```javascript
  } else if (num < field.min || num > field.max) {
    errors.push(field.label + ' must be between ' + field.min + '% and ' + field.max + '%.');
  }
  ```

  **After:**
  ```javascript
  } else if (num < 0 || num > field.max) {
    errors.push(field.label + ' improvement must be between 0% and ' + field.max + '%.');
  }
  ```

- [ ] **Step 2.2 — Deploy and verify**

  ```bash
  clasp push
  ```

  In the wizard, set future=12, current=10 (once Task 3 adds the current slider). Net delta = 2%. Submit. Confirm no server validation error and that 0.02 is written to the cell.

- [ ] **Step 2.3 — Commit**

  ```bash
  git add Code.gs
  git commit -m "fix: allow benefit delta values below field.min in server validation"
  ```

---

## Task 3: Add CSS for dual-slider card

**File:** `_styles.html`

Add these styles at the end of the `<style>` block, before the closing `</style>` tag.

- [ ] **Step 3.1 — Add dual-slider section styles**

  ```css
  /* ── Dual Maturity Slider Card ──────────────────────────────────────────── */
  .dual-slider-section {
    margin-top: 10px;
    padding: 10px 14px;
    border-radius: var(--radius);
    background: var(--bg);
    border: 1px solid var(--border);
  }

  .dual-slider-section + .dual-slider-section {
    margin-top: 6px;
  }

  .dual-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .5px;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dual-section-label.current-label {
    color: var(--text-mid);
  }

  .dual-section-label.future-label {
    color: var(--arena-dark);
  }

  .dual-section-label .section-badge {
    font-size: 12px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 10px;
    margin-left: auto;
  }

  .current-label .section-badge {
    background: #E2E8F0;
    color: var(--text-mid);
  }

  .future-label .section-badge {
    background: var(--arena-tint);
    color: var(--arena-dark);
  }

  /* Current-state slider uses a flat grey gradient */
  .current-state-track input[type="range"] {
    background: linear-gradient(to right, #CBD5E0 0%, #A0AEC0 100%) !important;
  }

  /* Net benefit bar shown between the two sections */
  .net-benefit-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 0;
    gap: 8px;
    font-size: 12px;
    color: var(--text-mid);
  }

  .net-benefit-bar .net-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--arena-green);
    background: var(--arena-tint);
    border-radius: 10px;
    padding: 2px 10px;
  }

  .net-benefit-bar .net-value.zero {
    color: var(--text-light);
    background: #F0F0F0;
  }

  /* Replace the single slider-value-badge with a net badge in the header */
  .net-header-badge {
    margin-left: auto;
    font-size: 12px;
    font-weight: 700;
    color: var(--arena-green);
    background: var(--arena-tint);
    border-radius: 10px;
    padding: 2px 10px;
    white-space: nowrap;
  }

  .net-header-badge.zero {
    color: var(--text-light);
    background: #F0F0F0;
  }
  ```

- [ ] **Step 3.2 — Verify styles load without error**

  ```bash
  clasp push
  ```

  Open wizard and confirm no CSS errors in browser console. No visual change yet (new classes not used until Task 4).

- [ ] **Step 3.3 — Commit**

  ```bash
  git add _styles.html
  git commit -m "style: add dual-slider card CSS for current/future maturity sections"
  ```

---

## Task 4: Refactor `buildBenefitSlider` to dual-slider layout

**File:** `_script.html` — `buildBenefitSlider` function (~line 829) and a new `buildCurrentSlider` helper.

This is the largest change. Replace `buildBenefitSlider` entirely and add `buildCurrentSlider`.

- [ ] **Step 4.1 — Add `buildCurrentSlider` helper (add before `buildBenefitSlider`)**

  ```javascript
  /**
   * Builds the "Current State (pre-Arena)" slider.
   * Range: 0 → field.max. Neutral grey gradient. No maturity level descriptions.
   * Returns the <input type="range"> element.
   */
  function buildCurrentSlider(field) {
    var input = document.createElement('input');
    input.type = 'range';
    input.id = 'cur_' + field.id;
    input.name = 'cur_' + field.id;
    input.setAttribute('aria-label', 'Current state: ' + field.label);
    input.min = 0;
    input.max = field.max;
    input.step = 0.5;
    input.value = 0;
    WIZARD.currentStateData[field.id] = 0;
    // Grey gradient is applied via CSS class on parent .current-state-track
    return input;
  }
  ```

- [ ] **Step 4.2 — Replace `buildBenefitSlider` entirely**

  Find the full `buildBenefitSlider` function (lines 829–908) and replace it with:

  ```javascript
  function buildBenefitSlider(field) {
    var wrapper = make('div', 'slider-field');
    var defaultVal = (field.default !== null && field.default !== undefined) ? field.default : field.min;

    // ── Header: label | include toggle | net badge ─────────────────────────
    var header = make('div', 'slider-header');
    var labelEl = make('span', 'slider-label');
    labelEl.textContent = field.label;
    var toggle = buildIncludeToggle(field);
    var netBadge = make('span', 'net-header-badge');
    netBadge.id = 'nbadge_' + field.id;
    netBadge.textContent = defaultVal + '% net';
    header.appendChild(labelEl);
    header.appendChild(toggle);
    header.appendChild(netBadge);
    wrapper.appendChild(header);

    // ── Current State section ───────────────────────────────────────────────
    var curSection = make('div', 'dual-slider-section');

    var curLabel = make('div', 'dual-section-label current-label');
    var curLabelText = document.createElement('span');
    curLabelText.textContent = 'Today (without Arena)';
    var curBadge = make('span', 'section-badge');
    curBadge.id = 'cbadge_' + field.id;
    curBadge.textContent = '0%';
    curLabel.appendChild(curLabelText);
    curLabel.appendChild(curBadge);
    curSection.appendChild(curLabel);

    var curAnchors = make('div', 'slider-anchors');
    var curLow = make('span', 'anchor-low');
    curLow.textContent = 'No existing capability';
    var curHigh = make('span', 'anchor-high');
    curHigh.textContent = 'Strong existing advantage';
    curAnchors.appendChild(curLow);
    curAnchors.appendChild(curHigh);
    curSection.appendChild(curAnchors);

    var curTrack = make('div', 'slider-track-wrap current-state-track');
    var curInput = buildCurrentSlider(field);
    curTrack.appendChild(curInput);
    curSection.appendChild(curTrack);

    var curNumAnchors = make('div', 'slider-anchors');
    var curNumLow = make('span', 'anchor-low');
    curNumLow.textContent = '0%  Min';
    var curNumHigh = make('span', 'anchor-high');
    curNumHigh.textContent = 'Max  ' + field.max + '%';
    curNumAnchors.appendChild(curNumLow);
    curNumAnchors.appendChild(curNumHigh);
    curSection.appendChild(curNumAnchors);

    wrapper.appendChild(curSection);

    // ── Net benefit bar (between sections) ─────────────────────────────────
    var netBar = make('div', 'net-benefit-bar');
    var netArrow = document.createElement('span');
    netArrow.textContent = 'Net benefit with Arena:';
    var netVal = make('span', 'net-value');
    netVal.id = 'nval_' + field.id;
    netVal.textContent = defaultVal + '%';
    netBar.appendChild(netArrow);
    netBar.appendChild(netVal);
    wrapper.appendChild(netBar);

    // ── Future State section ────────────────────────────────────────────────
    var futSection = make('div', 'dual-slider-section');

    var futLabel = make('div', 'dual-section-label future-label');
    var futLabelText = document.createElement('span');
    futLabelText.textContent = 'With Arena (Target)';
    var futBadge = make('span', 'section-badge');
    futBadge.id = 'badge_' + field.id;
    futBadge.textContent = defaultVal + '%';
    futLabel.appendChild(futLabelText);
    futLabel.appendChild(futBadge);
    futSection.appendChild(futLabel);

    if (field.lowAnchor || field.highAnchor) {
      var anchorsDesc = make('div', 'slider-anchors');
      if (field.lowAnchor) {
        var lo = make('span', 'anchor-low');
        lo.textContent = field.lowAnchor;
        anchorsDesc.appendChild(lo);
      }
      if (field.highAnchor) {
        var hi = make('span', 'anchor-high');
        hi.textContent = field.highAnchor;
        anchorsDesc.appendChild(hi);
      }
      futSection.appendChild(anchorsDesc);
    }

    var futInput = makeSlider(field, defaultVal);
    WIZARD.formData[field.id] = defaultVal;
    var futTrack = make('div', 'slider-track-wrap');
    futTrack.appendChild(futInput);
    futSection.appendChild(futTrack);

    var dotsEl = null;
    var stateBox = null;
    if (field.maturityLevels && field.maturityLevels.length) {
      dotsEl = buildMaturityDots(field);
      futSection.appendChild(dotsEl);
    }

    var numAnchors = make('div', 'slider-anchors');
    var numLow = make('span', 'anchor-low');
    numLow.textContent = field.min + '%  Low';
    var numHigh = make('span', 'anchor-high');
    numHigh.textContent = 'High  ' + field.max + '%';
    numAnchors.appendChild(numLow);
    numAnchors.appendChild(numHigh);
    futSection.appendChild(numAnchors);

    if (field.maturityLevels && field.maturityLevels.length) {
      stateBox = make('div', 'maturity-state');
      stateBox.id = 'mstate_' + field.id;
      var stateInner = make('div', 'maturity-state-inner');
      stateInner.appendChild(make('div', 'state-label'));
      stateInner.appendChild(make('p', 'state-desc'));
      stateBox.appendChild(stateInner);
      futSection.appendChild(stateBox);
      updateMaturityUI(field, defaultVal, stateBox, dotsEl);
    }

    wrapper.appendChild(futSection);

    // ── Shared net updater ──────────────────────────────────────────────────
    function refreshNet() {
      var futVal = parseFloat(WIZARD.formData[field.id]) || 0;
      var curVal = parseFloat(WIZARD.currentStateData[field.id]) || 0;
      var delta  = Math.max(0, futVal - curVal);
      var isZero = delta === 0;

      // Net bar
      netVal.textContent = delta + '%';
      netVal.classList.toggle('zero', isZero);

      // Net header badge
      netBadge.textContent = delta + '% net';
      netBadge.classList.toggle('zero', isZero);
    }

    // ── Wire current slider ─────────────────────────────────────────────────
    curInput.addEventListener('input', function() {
      var curVal = parseFloat(curInput.value);
      var futVal = parseFloat(WIZARD.formData[field.id]) || 0;
      // Clamp: current must not exceed future
      if (curVal > futVal) {
        curVal = futVal;
        curInput.value = curVal;
      }
      WIZARD.currentStateData[field.id] = curVal;
      curBadge.textContent = curVal + '%';
      refreshNet();
    });

    // ── Wire future slider ──────────────────────────────────────────────────
    futInput.addEventListener('input', function() {
      var futVal = parseFloat(futInput.value);
      var curVal = parseFloat(WIZARD.currentStateData[field.id]) || 0;
      // Clamp: if current was above new future, pull current down
      if (curVal > futVal) {
        curVal = futVal;
        WIZARD.currentStateData[field.id] = curVal;
        curInput.value = curVal;
        curBadge.textContent = curVal + '%';
      }
      WIZARD.formData[field.id] = futVal;
      futBadge.textContent = futVal + '%';
      updateSliderGradient(futInput);
      if (stateBox && dotsEl) updateMaturityUI(field, futVal, stateBox, dotsEl);
      refreshNet();
    });

    updateSliderGradient(futInput);
    refreshNet();

    return wrapper;
  }
  ```

- [ ] **Step 4.3 — Deploy and visual test**

  ```bash
  clasp push
  ```

  Open wizard and navigate to Step 5. Verify:
  - Each benefit card shows two slider sections (Today / With Arena)
  - Moving the "Today" slider updates the current badge and net value
  - Moving the "With Arena" slider updates the future badge, maturity description, and net value
  - Dragging "Today" above "With Arena" clamps it to the future value (net stays ≥ 0)
  - Dragging "With Arena" below "Today" pulls "Today" down to match
  - The net header badge and net bar both update in real time
  - Steps 6 and 7 show the same dual-slider pattern

- [ ] **Step 4.4 — Commit**

  ```bash
  git add _script.html
  git commit -m "feat: refactor buildBenefitSlider to dual current/future maturity sliders"
  ```

---

## Task 5: Update Review step to show Current → Future (Net)

**File:** `_script.html` — `populateReview()` function (~line 620)

The review grid currently shows the raw future-state value for benefits. It should now show the full picture.

- [ ] **Step 5.1 — Update the benefit row rendering in `populateReview`**

  Find this block inside `populateReview` (inside the `sec.fields.forEach` for benefit sections):

  ```javascript
  if (sec.isBenefit && WIZARD.includeData[field.id + '_include'] === false) {
    value.className = 'rv-excluded';
    value.textContent = 'Excluded';
  } else if (rawVal === null || rawVal === undefined || rawVal === '') {
    value.className = 'rv-skip';
    value.textContent = '(using default)';
  } else if (field.unit === '%') {
    value.textContent = rawVal + '%';
  }
  ```

  Replace the `else if (field.unit === '%')` branch only:

  **Before:**
  ```javascript
  } else if (field.unit === '%') {
    value.textContent = rawVal + '%';
  }
  ```

  **After:**
  ```javascript
  } else if (field.unit === '%' && sec.isBenefit) {
    var cur = parseFloat(WIZARD.currentStateData[field.id]) || 0;
    var fut = parseFloat(rawVal) || 0;
    var net = Math.max(0, fut - cur);
    if (cur > 0) {
      value.textContent = cur + '% today \u2192 ' + fut + '% target (net: ' + net + '%)';
    } else {
      value.textContent = fut + '% (net: ' + net + '%)';
    }
  } else if (field.unit === '%') {
    value.textContent = rawVal + '%';
  }
  ```

- [ ] **Step 5.2 — Deploy and test review step**

  ```bash
  clasp push
  ```

  Navigate to step 9. Verify:
  - Benefit fields with current > 0 show "3% today → 10% target (net: 7%)"
  - Benefit fields with current = 0 show "10% (net: 10%)"
  - Excluded benefits still show "Excluded"
  - Non-benefit % fields (like Business Assumptions) are unaffected

- [ ] **Step 5.3 — Commit**

  ```bash
  git add _script.html
  git commit -m "feat: update review step to show current → future (net) for benefit fields"
  ```

---

## Task 6: Expose `refreshNet` so `applyCurrentValues` can update the net badge on restore

**File:** `_script.html` — two locations: `buildBenefitSlider` (Task 4) and `applyCurrentValues` (~line 1113)

**Problem:** `refreshNet()` is a closure inside `buildBenefitSlider`. When `applyCurrentValues` restores a value from the sheet, it updates `input.value` and calls `updateSliderGradient`/`updateMaturityUI` directly — but it cannot reach `refreshNet()`. This means after restore, the net header badge and net-value bar still show the initial default, not the restored future value.

**Fix:** Add a module-level registry `WIZARD._netRefreshers` that maps `field.id → refreshNet fn`. `buildBenefitSlider` registers its closer there; `applyCurrentValues` calls it after restoring a benefit value.

- [ ] **Step 6.1 — Add `_netRefreshers` to WIZARD state**

  In the WIZARD object (updated in Task 1), add one more property:

  ```javascript
  var WIZARD = {
    currentStep: 1,
    totalSteps: 9,
    formData: {},
    includeData: {},
    currentStateData: {},
    _netRefreshers: {},   // ← ADD: field.id → refreshNet()
    config: null,
    currentValues: {}
  };
  ```

- [ ] **Step 6.2 — Register `refreshNet` in `buildBenefitSlider`**

  At the end of the `// ── Shared net updater` section in `buildBenefitSlider` (just before the current-slider wire-up), add one line after the `refreshNet` function definition:

  ```javascript
  // Register so applyCurrentValues can trigger a net update after restore
  WIZARD._netRefreshers[field.id] = refreshNet;
  ```

  The full "Shared net updater" block should look like:

  ```javascript
  // ── Shared net updater ──────────────────────────────────────────────────
  function refreshNet() {
    var futVal = parseFloat(WIZARD.formData[field.id]) || 0;
    var curVal = parseFloat(WIZARD.currentStateData[field.id]) || 0;
    var delta  = Math.max(0, futVal - curVal);
    var isZero = delta === 0;

    netVal.textContent = delta + '%';
    netVal.classList.toggle('zero', isZero);

    netBadge.textContent = delta + '% net';
    netBadge.classList.toggle('zero', isZero);
  }

  // Register so applyCurrentValues can trigger a net update after restore
  WIZARD._netRefreshers[field.id] = refreshNet;
  ```

- [ ] **Step 6.3 — Call the registry in `applyCurrentValues`**

  Find the benefit-fields restore block in `applyCurrentValues` (~line 1148). After the existing `updateMaturityUI` call, add a `refreshNet` call via the registry:

  Find this section:
  ```javascript
  if (val !== null && val !== undefined) {
    var input = document.getElementById('field_' + field.id);
    if (input) {
      var numVal = clamp(parseFloat(val), parseFloat(input.min), parseFloat(input.max));
      input.value = numVal;
      WIZARD.formData[field.id] = numVal;
      var badge = document.getElementById('badge_' + field.id);
      if (badge) badge.textContent = numVal + '%';
      updateSliderGradient(input);
      if (field.maturityLevels) {
        var stateEl = document.getElementById('mstate_' + field.id);
        var dotsEl  = document.getElementById('mdots_'  + field.id);
        updateMaturityUI(field, numVal, stateEl, dotsEl);
      }
    }
  }
  ```

  Add the refresher call immediately after the `if (field.maturityLevels)` block, still inside the outer `if (val !== null ...)` guard:

  ```javascript
  if (val !== null && val !== undefined) {
    var input = document.getElementById('field_' + field.id);
    if (input) {
      var numVal = clamp(parseFloat(val), parseFloat(input.min), parseFloat(input.max));
      input.value = numVal;
      WIZARD.formData[field.id] = numVal;
      var badge = document.getElementById('badge_' + field.id);
      if (badge) badge.textContent = numVal + '%';
      updateSliderGradient(input);
      if (field.maturityLevels) {
        var stateEl = document.getElementById('mstate_' + field.id);
        var dotsEl  = document.getElementById('mdots_'  + field.id);
        updateMaturityUI(field, numVal, stateEl, dotsEl);
      }
      // Refresh net badge now that future value is restored (current stays 0)
      if (WIZARD._netRefreshers[field.id]) WIZARD._netRefreshers[field.id]();
    }
  }
  ```

- [ ] **Step 6.4 — Deploy and test restore**

  ```bash
  clasp push
  ```

  1. Submit wizard with `reduceTimeToMarket` future=20%, current=5% → net=15% written to sheet
  2. Close and re-open wizard
  3. Navigate to Step 5
  4. Verify `reduceTimeToMarket` future slider shows 15% (restored delta), current=0, net badge shows "15% net"
  5. Net badge should NOT show "10% net" (the stale default) — if it still shows default, the registry call isn't firing

- [ ] **Step 6.5 — Confirm delta writes end to end**

  1. Set "Today" slider to 3%, "With Arena" to 10%, net shows 7%
  2. Submit wizard
  3. Open the Benefits Calc sheet, find the cell for that field in column D
  4. Confirm the cell value is `0.07` (7% stored as decimal)

- [ ] **Step 6.6 — Commit**

  ```bash
  git add _script.html
  git commit -m "fix: expose refreshNet via registry so applyCurrentValues updates net badge on restore"
  ```

---

## Task 7: Update Help.html and docs

**Files:** `Help.html`, `Docs/CODE_REVIEW.md`

- [ ] **Step 7.1 — Update Help.html benefit slider description**

  Find the tab content that describes steps 5-7 (benefit sliders). Add explanation of the dual-slider:

  Look for existing text describing the benefit sliders in the help tab. Add a paragraph like:

  > "Each benefit has two sliders: **Today (without Arena)** shows what your current system already delivers, and **With Arena (Target)** is where Arena will take you. The **Net benefit** — the difference — is what gets written to the spreadsheet and drives the ROI calculation."

- [ ] **Step 7.2 — Add dual-maturity section to CODE_REVIEW.md**

  Add a section after the `_script.html` analysis entry:

  ```markdown
  ### Dual Maturity Slider (Steps 5–7)

  Each benefit slider card contains two sliders:
  - **Current State (pre-Arena):** range 0–field.max, stored in `WIZARD.currentStateData[field.id]`. Not written to sheet.
  - **Future State (with Arena):** range field.min–field.max, stored in `WIZARD.formData[field.id]`. Same maturity levels as before.
  - **Delta:** `Math.max(0, future - current)` computed in `submitWizard()` and sent as the payload value for each benefit field. Written to Benefits Calc column D as a decimal.
  - Hard clamp: current slider cannot exceed future slider (enforced on both slider `input` events).
  - On restore (loading from sheet): future state populated from saved delta, current state always resets to 0.
  ```

- [ ] **Step 7.3 — Deploy final build**

  ```bash
  clasp push
  ```

- [ ] **Step 7.4 — Final end-to-end test**

  Full wizard run:
  1. Step 1: enter Company Profile
  2. Steps 2–4: use defaults
  3. Step 5: set "Reduce Time to Market" → Today: 5%, With Arena: 20% → net should show 15%
  4. Step 5: set "Incremental Margin" → Today: 0%, With Arena: 2% → net: 2%
  5. Step 5: exclude "Reduce CM Material"
  6. Navigate to Step 9 review — confirm "5% today → 20% target (net: 15%)" displays
  7. Submit
  8. Open Benefits Calc sheet:
     - Cell D2 (reduceTimeToMarket): `0.15` ✓
     - Cell D4 (incrementalMargin): `0.02` ✓
     - Cell F7 (reduceCMMaterial include): `No` ✓

- [ ] **Step 7.5 — Commit and push**

  ```bash
  git add Help.html Docs/CODE_REVIEW.md
  git commit -m "docs: update Help.html and CODE_REVIEW for dual maturity slider feature"
  git push
  ```

---

## Known Constraints / Edge Cases

| Case | Behavior |
|------|----------|
| Current = Future | Net = 0%. Zero badge styling applied. Written as 0.00 to sheet. |
| Current > Future | Prevented by hard clamp on both sliders. |
| Restore from sheet — delta < field.min | Future slider clamped to field.min; current stays 0. Net shown as field.min. Acceptable V1 behavior. |
| Excluded benefit | Include toggle still works. Net value is computed but the exclude toggle writes "No" to column F — the sheet formula ignores excluded benefits. |
| All defaults (current=0, future=default) | Net = field.default. Identical behavior to pre-feature default. No regression. |
