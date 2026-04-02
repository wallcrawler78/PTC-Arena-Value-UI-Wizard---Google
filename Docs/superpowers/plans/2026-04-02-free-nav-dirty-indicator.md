# Free Navigation + Dirty Step Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to click any step in the wizard's nav indicator to jump directly to it, and show an orange dot badge on any step the user has interacted with.

**Architecture:** Four targeted changes to two files. CSS additions in `_styles.html`. Three coordinated changes to `_script.html`: (1) WIZARD state + new navigation functions, (2) step indicator DOM restructure (inner `circle-text` span + `dirty-dot` span, event delegation for nav clicks), (3) dirty tracking via two delegated listeners on `#wizBody`. `validateCurrentStep()` is refactored into `validateStep(stepNum)` with a backward-compatible wrapper — no callers change.

**Tech Stack:** Google Apps Script (GAS), ES5 JavaScript (GAS iframe constraint — no let/const/arrow functions), CSS. Deployed via `clasp push`. No automated test framework — verification is manual in the wizard.

---

## Background: What Exists Today

- `buildStepIndicator()` (~line 43): builds 9 `.step-item` elements each with a `.step-circle` (contains the number as `textContent`) and a `.step-label`. No click handlers.
- `updateStepIndicator()` (~line 67): sets active/done CSS classes and writes `circle.textContent = num` or `circle.textContent = '\u2713'` directly — this destroys child nodes, which is why we must restructure the circle DOM before appending any child spans.
- `validateCurrentStep()` (~line 1402): reads `WIZARD.currentStep` directly; called only from `goNext()`.
- `bindNavigation()` (~line 1305): wires Back/Next/Submit buttons and Enter-key handler.
- `WIZARD` state object (~line 6): global state; `touchedSteps` does not yet exist.

## Files Changed

| File | What changes |
|------|-------------|
| `_styles.html` | Add `.step-item` cursor/hover, `position: relative` on `.step-circle`, `.dirty-dot`, `.step-circle.touched .dirty-dot` |
| `_script.html` | Add `touchedSteps` to WIZARD; refactor `validateCurrentStep` → `validateStep(stepNum)`; add `navigateTo()`; restructure `buildStepIndicator()` + `updateStepIndicator()`; add `markStepTouched()` + two delegated listeners in `bindNavigation()` |

---

## Task 1: CSS — free navigation hover + dirty dot styles

**File:** `_styles.html`

Add the new rules at the very end of the `<style>` block, just before `</style>`. The file already has dual-slider CSS added earlier — append after that block.

- [ ] **Step 1.1 — Read the end of `_styles.html` to find the insertion point**

  Read the last ~20 lines of `_styles.html` to confirm the exact line of `</style>`.

- [ ] **Step 1.2 — Append the CSS block**

  Add the following immediately before `</style>`:

  ```css
  /* ── Free navigation + dirty indicator ──────────────────────────────────── */
  .step-item {
    cursor: pointer;
  }

  .step-item:hover .step-circle:not(.active) {
    background: #C8E6C9;
  }

  /* position: relative is required so .dirty-dot's absolute positioning
     is anchored to the circle, not a distant ancestor */
  .step-circle {
    position: relative;
  }

  .dirty-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #F47920;
    border: 2px solid #fff;
    display: none;
  }

  .step-circle.touched .dirty-dot {
    display: block;
  }
  ```

- [ ] **Step 1.3 — Commit**

  ```bash
  git add _styles.html
  git commit -m "style: add step indicator cursor, hover, and dirty-dot badge CSS"
  ```

---

## Task 2: WIZARD state + `validateStep` + `navigateTo`

**File:** `_script.html`

Three additions with no visible UI effect yet — they just add state and functions that later tasks will call.

- [ ] **Step 2.1 — Add `touchedSteps` to the WIZARD object**

  Find the WIZARD object (~line 6). It currently ends with:

  ```javascript
  var WIZARD = {
    currentStep: 1,
    totalSteps: 9,
    formData: {},
    includeData: {},
    currentStateData: {},   // pre-Arena baseline values per benefit field (not written to sheet)
    _netRefreshers: {},     // registry: field.id → refreshNet() closure (populated by buildBenefitSlider)
    config: null,
    currentValues: {}
  };
  ```

  Add `touchedSteps: {}` after `_netRefreshers`:

  ```javascript
  var WIZARD = {
    currentStep: 1,
    totalSteps: 9,
    formData: {},
    includeData: {},
    currentStateData: {},   // pre-Arena baseline values per benefit field (not written to sheet)
    _netRefreshers: {},     // registry: field.id → refreshNet() closure (populated by buildBenefitSlider)
    touchedSteps: {},       // stepNum → true when user has interacted with any field on that step
    config: null,
    currentValues: {}
  };
  ```

- [ ] **Step 2.2 — Refactor `validateCurrentStep` into `validateStep(stepNum)`**

  Find `validateCurrentStep()` (~line 1402). It currently reads:

  ```javascript
  function validateCurrentStep() {
    if (WIZARD.currentStep > 4) return true; // sliders always have valid defaults
    var fields = getFieldsByStep(WIZARD.currentStep, 'dataInput');
    var valid = true;
    fields.forEach(function(field) {
      if (field.required) {
        var val = WIZARD.formData[field.id];
        if (val === null || val === undefined || String(val).trim() === '') {
          showFieldError(field.id, field.label + ' is required.');
          valid = false;
        }
      }
    });
    return valid;
  }
  ```

  Replace it with `validateStep(stepNum)` plus a one-line wrapper:

  ```javascript
  function validateStep(stepNum) {
    if (stepNum > 4) return true; // sliders always have valid defaults
    var fields = getFieldsByStep(stepNum, 'dataInput');
    var valid = true;
    fields.forEach(function(field) {
      if (field.required) {
        var val = WIZARD.formData[field.id];
        if (val === null || val === undefined || String(val).trim() === '') {
          showFieldError(field.id, field.label + ' is required.');
          valid = false;
        }
      }
    });
    return valid;
  }

  function validateCurrentStep() {
    return validateStep(WIZARD.currentStep);
  }
  ```

  `goNext()` still calls `validateCurrentStep()` — no change needed there.

- [ ] **Step 2.3 — Add `navigateTo(target)` near `goBack` and `goNext`**

  Find `goBack()` (~line 1319). Add `navigateTo` immediately after `goNext`:

  ```javascript
  function navigateTo(target) {
    if (target === WIZARD.currentStep) return;
    if (target > WIZARD.currentStep) {
      // Validate required-field steps up to (but not including) target.
      // Only step 1 has required fields in practice.
      for (var s = 1; s < target; s++) {
        if (s > 4) break;
        if (!validateStep(s)) {
          showStep(s);
          return;
        }
      }
    }
    showStep(target);
  }
  ```

- [ ] **Step 2.4 — Commit**

  ```bash
  git add _script.html
  git commit -m "feat: add touchedSteps state, validateStep, and navigateTo"
  ```

---

## Task 3: Restructure step indicator DOM + wire nav clicks + update dirty dot rendering

**File:** `_script.html` — `buildStepIndicator()` (line 43) and `updateStepIndicator()` (line 67)

**Why the DOM restructure is needed:** `updateStepIndicator()` currently calls `circle.textContent = num` and `circle.textContent = '\u2713'`. Setting `textContent` on an element destroys all its child nodes. If we append a `.dirty-dot` span to the circle, it would be wiped on every navigation. The fix: put the number/checkmark in an inner `<span class="circle-text">` and only mutate that span's text — leaving the `.dirty-dot` sibling untouched.

- [ ] **Step 3.1 — Replace `buildStepIndicator()`**

  Find the full `buildStepIndicator()` function (lines 43–65). Replace it entirely:

  ```javascript
  function buildStepIndicator() {
    var container = document.getElementById('stepIndicator');
    clearEl(container);
    STEP_META.forEach(function(meta, idx) {
      var item = make('div', 'step-item');
      item.dataset.step = meta.num;

      var circle = make('div', 'step-circle');
      var circleText = make('span', 'circle-text');
      circleText.textContent = meta.num;
      var dot = make('span', 'dirty-dot');
      circle.appendChild(circleText);
      circle.appendChild(dot);

      var label = make('div', 'step-label');
      label.textContent = meta.title;

      item.appendChild(circle);
      item.appendChild(label);
      container.appendChild(item);

      if (idx < STEP_META.length - 1) {
        container.appendChild(make('div', 'step-connector'));
      }
    });

    // Free navigation: click any step item to jump there
    container.addEventListener('click', function(e) {
      var item = e.target.closest('.step-item');
      if (!item) return;
      navigateTo(parseInt(item.dataset.step, 10));
    });

    updateStepIndicator();
  }
  ```

- [ ] **Step 3.2 — Replace `updateStepIndicator()`**

  Find the full `updateStepIndicator()` function (lines 67–88). Replace it entirely:

  ```javascript
  function updateStepIndicator() {
    document.querySelectorAll('.step-item').forEach(function(item) {
      var num = parseInt(item.dataset.step, 10);
      var circle = item.querySelector('.step-circle');
      var circleText = circle ? circle.querySelector('.circle-text') : null;
      item.classList.remove('active', 'done');
      if (num === WIZARD.currentStep) {
        item.classList.add('active');
        if (circleText) circleText.textContent = num;
      } else if (num < WIZARD.currentStep) {
        item.classList.add('done');
        if (circleText) circleText.textContent = '\u2713';
      } else {
        if (circleText) circleText.textContent = num;
      }
      // Dirty dot: show orange badge if user has interacted with this step
      if (circle) {
        if (WIZARD.touchedSteps[num]) {
          circle.classList.add('touched');
        } else {
          circle.classList.remove('touched');
        }
      }
    });
    document.querySelectorAll('.step-connector').forEach(function(conn, idx) {
      conn.style.background = (idx < WIZARD.currentStep - 1)
        ? 'var(--arena-light)' : 'var(--border)';
    });
    document.getElementById('progressText').textContent =
      'Step ' + WIZARD.currentStep + ' of ' + WIZARD.totalSteps;
  }
  ```

- [ ] **Step 3.3 — Verify**

  Confirm:
  - `buildStepIndicator` no longer calls `circle.textContent` directly (only `circleText.textContent`)
  - `updateStepIndicator` no longer calls `circle.textContent` — only `circleText.textContent`
  - The click delegation on `container` calls `navigateTo` (defined in Task 2)
  - The `touched` class is toggled on `circle` based on `WIZARD.touchedSteps[num]`

- [ ] **Step 3.4 — Commit**

  ```bash
  git add _script.html
  git commit -m "feat: restructure step indicator for click navigation and dirty dot support"
  ```

---

## Task 4: Dirty tracking — `markStepTouched` + delegated listeners

**File:** `_script.html` — `bindNavigation()` (~line 1305)

This adds the two event listeners that mark steps dirty when the user interacts with fields. Both use event delegation on `#wizBody` so there's no need to touch any existing field builder code.

- [ ] **Step 4.1 — Add `markStepTouched` and the two listeners at the end of `bindNavigation()`**

  Find `bindNavigation()` (lines 1305–1317). It currently ends before the closing `}`. Add inside it, after the existing `keydown` listener:

  ```javascript
  // Dirty tracking: mark a step touched when the user interacts with any field
  function markStepTouched(el) {
    var panel = el.closest('.step-panel');
    if (!panel) return;
    var stepNum = parseInt(panel.id.replace('step-', ''), 10);
    if (isNaN(stepNum)) return;
    if (WIZARD.touchedSteps[stepNum]) return; // already dirty — skip re-render
    WIZARD.touchedSteps[stepNum] = true;
    updateStepIndicator();
  }

  var wizBody = document.getElementById('wizBody');

  // Input events: text fields, sliders, number inputs
  wizBody.addEventListener('input', function(e) {
    markStepTouched(e.target);
  });

  // Click events: include-toggle buttons (not <input> elements, won't fire 'input')
  wizBody.addEventListener('click', function(e) {
    if (e.target.closest('.include-toggle')) {
      markStepTouched(e.target);
    }
  });
  ```

- [ ] **Step 4.2 — Verify the placement**

  Confirm `markStepTouched` is defined inside `bindNavigation()` (closure scope is fine — it's called only from the two listeners defined in the same function). Confirm the two `addEventListener` calls are inside `bindNavigation()` before the closing `}`.

- [ ] **Step 4.3 — Commit**

  ```bash
  git add _script.html
  git commit -m "feat: add dirty step tracking via delegated input and click listeners"
  ```

---

## Task 5: Deploy and manual verification

- [ ] **Step 5.1 — Push to GAS**

  ```bash
  clasp push
  ```

- [ ] **Step 5.2 — Verify free navigation**

  Open the wizard in the spreadsheet. Check:
  - Clicking step 3 from step 1 (without filling required fields): shows errors on step 1 and stays there
  - Filling step 1 required fields, then clicking step 5: jumps directly to step 5
  - Clicking step 1 from step 5: jumps back with no validation
  - Clicking the current step: no-op (nothing happens)
  - Clicking step 9 from step 1 (after filling required fields): jumps to Review, populates the review grid

- [ ] **Step 5.3 — Verify dirty dot**

  - On a fresh wizard open: no orange dots on any step
  - Type anything in step 1 (Company Name): orange dot appears on step 1 circle
  - Navigate to step 5, move any slider: orange dot appears on step 5
  - Navigate back to step 1: step 1 dot is still showing (dots persist)
  - Dots show on both "done" (green ✓) and "active" (dark green) circles
  - Loading from sheet via `applyCurrentValues()` (re-open the wizard after submitting): dots do NOT appear (pre-filled values are not "touched")

- [ ] **Step 5.4 — Commit**

  No code changes in this task. If bugs are found, fix them in a new commit before moving on.

---

## Edge Cases to Test

| Scenario | Expected behaviour |
|----------|--------------------|
| User clears step 1 fields after navigating to step 3, then clicks step 5 | Errors shown on step 1, stays on step 1 |
| User clicks step 9 (Review) directly after filling step 1 | Review populates correctly via `populateReview()` (already called in `showStep(9)`) |
| Auto-fill fires when navigating to step 3 or 4 | No dirty dot — auto-fill writes to `WIZARD.formData` directly, not via user input events |
| Legacy TCO currency inputs (step 8) | `input` event fires on currency `<input>` elements → step 8 gets dot correctly |
| Benefit include toggles (steps 5–7) | `click` delegation on `.include-toggle` → correct step gets dot |
