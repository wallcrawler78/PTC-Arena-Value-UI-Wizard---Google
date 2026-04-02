# Free Navigation + Dirty Step Indicator — Design Spec

**Date:** 2026-04-02  
**Status:** Approved  

---

## Goal

Allow users to click any step in the wizard's step indicator to jump directly to it, and show an orange dot badge on step indicator circles where the user has interacted with (modified) any field.

---

## Background

The current wizard only supports sequential navigation via Back/Next buttons. The step indicator is purely decorative — clicking a step circle does nothing. Users must navigate through every step in order, even when they want to revisit a specific section.

The step indicator (`#stepIndicator`) is built once by `buildStepIndicator()` and updated on each nav by `updateStepIndicator()`. All 9 step panels are pre-rendered in `#wizBody` as `.step-panel` elements; CSS `.active` class controls which is visible. `WIZARD.currentStep` is the single source of truth for the current step, mutated only in `showStep(num)`.

---

## Feature 1: Free Navigation

### Behaviour

- Clicking any `.step-item` in the step indicator navigates to that step.
- **Backward navigation** (target < current): always allowed with no validation.
- **Forward navigation** (target > current): validate all required-field steps (steps 1–4) between step 1 and the target. If any fail, navigate to the first failing step and display field errors there.
- Clicking the current step is a no-op.
- Step items get `cursor: pointer` and a hover state so they are clearly interactive.

### Implementation

**New function: `navigateTo(target)`**

```javascript
function navigateTo(target) {
  if (target === WIZARD.currentStep) return;
  if (target > WIZARD.currentStep) {
    // Validate all required-field steps up to (but not including) target.
    // Intent: the user should land on the target step; if a prerequisite step
    // fails, redirect to that step instead. Step 4's own required fields are
    // not validated here — they are enforced by goNext() when leaving step 4.
    // In practice only step 1 has required fields, so this rarely iterates
    // more than once.
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

**Refactor: `validateCurrentStep()` → `validateStep(stepNum)`**

The existing `validateCurrentStep()` is renamed `validateStep(stepNum)` and accepts an explicit step number instead of reading `WIZARD.currentStep`. A one-line `validateCurrentStep()` wrapper calls `validateStep(WIZARD.currentStep)` so `goNext()` is unchanged.

**Event delegation on `#stepIndicator`**

Added inside `buildStepIndicator()`, after building the DOM:

```javascript
container.addEventListener('click', function(e) {
  var item = e.target.closest('.step-item');
  if (!item) return;
  navigateTo(parseInt(item.dataset.step, 10));
});
```

---

## Feature 2: Dirty Step Indicator

### Behaviour

- A step is "dirty" if the user has interacted with any field on that step during the current session (slider moved, text typed, include toggle clicked).
- Values pre-loaded from the sheet via `applyCurrentValues()` do not count as dirty.
- Dirty steps show an orange dot badge on their step circle.
- The dot persists for the rest of the session (no un-dirty).
- The dot can appear on any step — active, completed, or future.

### State

```javascript
WIZARD.touchedSteps = {};   // stepNum (integer) → true
```

Added to the WIZARD object alongside `formData`, `includeData`, etc.

### Input tracking — event delegation on `#wizBody`

Two delegated listeners are added in `bindNavigation()`:

```javascript
// Track field edits (text inputs, sliders, number inputs)
document.getElementById('wizBody').addEventListener('input', function(e) {
  markStepTouched(e.target);
});

// Track include-toggle clicks (benefit <button> elements inside .include-toggle wrapper)
document.getElementById('wizBody').addEventListener('click', function(e) {
  if (e.target.closest('.include-toggle')) {
    markStepTouched(e.target);
  }
});

function markStepTouched(el) {
  var panel = el.closest('.step-panel');
  if (!panel) return;
  var stepNum = parseInt(panel.id.replace('step-', ''), 10);
  if (isNaN(stepNum)) return;
  WIZARD.touchedSteps[stepNum] = true;
  updateStepIndicator();
}
```

### Dot badge DOM

**Problem with existing `updateStepIndicator()`:** The current implementation uses `circle.textContent = num` and `circle.textContent = '\u2713'` to update the step number/checkmark. Setting `textContent` on the circle replaces all child nodes, which would destroy any appended `.dirty-dot` span.

**Fix:** Restructure each `.step-circle` to contain a dedicated `<span class="circle-text">` for the number/checkmark, plus a `<span class="dirty-dot">`. All textContent mutations are then made on the inner `.circle-text` span, not on the circle element itself.

In `buildStepIndicator()`, build each circle as:

```javascript
var circle = make('div', 'step-circle');
var circleText = make('span', 'circle-text');
circleText.textContent = meta.num;
circle.appendChild(circleText);
var dot = make('span', 'dirty-dot');
circle.appendChild(dot);
```

In `updateStepIndicator()`, replace all three `circle.textContent = ...` assignments with mutations on the inner span:

```javascript
var circleText = circle.querySelector('.circle-text');
if (num === WIZARD.currentStep) {
  item.classList.add('active');
  if (circleText) circleText.textContent = num;
} else if (num < WIZARD.currentStep) {
  item.classList.add('done');
  if (circleText) circleText.textContent = '\u2713';
} else {
  if (circleText) circleText.textContent = num;
}
// Dirty dot
if (WIZARD.touchedSteps[num]) {
  circle.classList.add('touched');
} else {
  circle.classList.remove('touched');
}
```

CSS in `_styles.html` controls dot visibility:

```css
.dirty-dot {
  display: none;
}
.step-circle.touched .dirty-dot {
  display: block;
}
```

---

## CSS Changes (`_styles.html`)

```css
/* ── Free navigation ─────────────────────────────────────────────────────── */
.step-item {
  cursor: pointer;
}
.step-item:hover .step-circle:not(.active) {
  background: #C8E6C9;   /* light green tint on hover — not active step */
}

/* ── Dirty dot badge ─────────────────────────────────────────────────────── */

/* position: relative is required so the dot's absolute positioning is
   anchored to the circle, not a distant ancestor. Added to existing rule. */
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

---

## Files Changed

| File | Changes |
|------|---------|
| `_script.html` | Add `touchedSteps: {}` to WIZARD; rename `validateCurrentStep` to `validateStep(stepNum)`; add `validateCurrentStep()` wrapper; add `navigateTo(target)`; update `buildStepIndicator()` (dot element + click delegation); update `updateStepIndicator()` (touched class); add `markStepTouched()` + two delegated listeners in `bindNavigation()` |
| `_styles.html` | Add `.step-item` cursor/hover; add `.dirty-dot` and `.step-circle.touched .dirty-dot` rules |

No changes to `Config.gs`, `Code.gs`, `SheetAudit.gs`, `Wizard.html`, or `Help.html`.

---

## Edge Cases

| Case | Behaviour |
|------|-----------|
| User clears step 1 required fields after navigating forward | Clicking any step > 1 triggers validation, shows errors on step 1, navigates to step 1 |
| `applyCurrentValues()` fires on dialog open | Does not set `touchedSteps` — no dot on load |
| Auto-fill functions (`autoFillStep3Defaults`, `autoFillStep4Defaults`) | These write to `WIZARD.formData` and DOM directly, not via user input events — no dot triggered |
| Step 9 (Review) | Can be navigated to directly once step 1 is valid; `populateReview()` already called in `showStep(9)` |
| Include toggles | Handled by click delegation checking `.include-toggle` class |
