# Legacy TCO Analysis — Arena Value Assessment Wizard

> **SUPERSEDED — Planning document only.** Legacy TCO has been implemented as Step 8 of the wizard.
> The actual implementation differs from this proposal: it uses a unit-cost × qty structure
> writing to columns C/D/F (not a single column D), and does not include an Arena investment
> section in the wizard (may be handled elsewhere in the sheet).
> See `Docs/SHEET_CONFIG.md` for the verified field mapping and `Docs/CODE_REVIEW.md` for architecture details.

---

## Executive Summary

### What Legacy TCO Measures

The **Legacy TCO** (Total Cost of Ownership) tab captures what a customer is paying *today* to manage product data — whether that's an on-premise PLM system (Windchill, Teamcenter, Agile PLM), a file-share/SharePoint approach, or a manual/spreadsheet-based process. By quantifying current-state costs alongside the proposed Arena investment, the spreadsheet builds a **side-by-side TCO comparison** over a multi-year horizon (typically 3 or 5 years).

### Why It Matters

Without Legacy TCO data, the ROI model only shows Arena's *benefits* (from Benefits Calc) but not the *net cost position*. Legacy TCO enables:

1. **TCO Comparison** — "You pay $X/year to keep your current system running. Arena costs $Y/year. Net difference = $Z."
2. **Payback Period** — When does the Arena investment break even vs. staying on legacy?
3. **5-Year Projection** — Total spend trajectory: legacy costs often grow (infrastructure, upgrades), while Arena SaaS costs are predictable.
4. **Executive Justification** — CFOs need a "cost to do nothing" baseline, not just a benefits story.

The Legacy TCO tab likely feeds into a **TCO Projections** or **Summary/ROI** tab that combines Benefits Calc savings with the net cost delta between legacy and Arena.

---

## Current Wizard Coverage (for context)

| Tab | Wizard Steps | Rows |
|-----|-------------|------|
| Data Input | Steps 1-5 (Company, Assumptions, Costs, Inventory, Workforce) | D3-D48 |
| Benefits Calc | Steps 6-8 (Benefit sliders + include toggles) | D2-D19, F2-F19 |
| **Legacy TCO** | **Not yet covered** | **Unknown** |

---

## Proposed Legacy TCO Field Definitions

Based on standard Arena PLM value calculator conventions, the Legacy TCO tab likely has these input sections. Row numbers are estimates — **must be verified against the live sheet**.

### Section A: Current System Costs (Annual)

These capture what the customer spends today on their existing product data management approach.

| id | label | est. row | storeAs | default | step | UI type |
|----|-------|----------|---------|---------|------|---------|
| `legacySystemType` | Current System Type | 3 | text | (dropdown) | 9 | dropdown |
| `legacyLicenseFees` | Annual License / Subscription Fees | 5 | currency | 0 | 9 | currency input |
| `legacyMaintenanceFees` | Annual Maintenance & Support Fees | 6 | currency | 0 | 9 | currency input |
| `legacyITInfrastructure` | IT Infrastructure Costs (servers, DB, hosting) | 7 | currency | 0 | 9 | currency input |
| `legacyITSupportFTEs` | IT Support FTEs for Legacy System | 8 | number | 1 | 9 | number input |
| `legacyITSupportSalary` | IT Support Annual Salary | 9 | currency | 120000 | 9 | currency input |
| `legacyCustomizationMaint` | Annual Customization / Integration Maintenance | 10 | currency | 0 | 9 | currency input |
| `legacyTrainingCosts` | Annual Training Costs | 11 | currency | 0 | 9 | currency input |
| `legacyUpgradeCosts` | Periodic Upgrade Costs (annualized) | 12 | currency | 0 | 9 | currency input |

**Dropdown options for `legacySystemType`:**
- Agile PLM (Oracle)
- Windchill (PTC)
- Teamcenter (Siemens)
- SolidWorks PDM
- SharePoint / File Share
- Spreadsheets / Manual
- Other
- None / No System

### Section B: Arena Investment Costs

These capture the Arena subscription and implementation costs used for the TCO comparison.

| id | label | est. row | storeAs | default | step | UI type |
|----|-------|----------|---------|---------|------|---------|
| `arenaSubscriptionAnnual` | Arena Annual Subscription Cost | 16 | currency | 0 | 9 | currency input |
| `arenaImplementation` | Implementation / Professional Services (one-time) | 17 | currency | 0 | 9 | currency input |
| `arenaInternalSetup` | Internal IT Setup Costs (one-time) | 18 | currency | 0 | 9 | currency input |
| `arenaTraining` | Training Investment (one-time) | 19 | currency | 0 | 9 | currency input |
| `arenaOngoingAdmin` | Ongoing Admin / Support (annual) | 20 | currency | 0 | 9 | currency input |

### Section C: Comparison Horizon

| id | label | est. row | storeAs | default | step | UI type |
|----|-------|----------|---------|---------|------|---------|
| `tcoComparisonYears` | TCO Comparison Period (years) | 23 | number | 5 | 9 | dropdown (3 or 5) |
| `legacyCostGrowthRate` | Legacy Cost Annual Growth Rate | 24 | decimal | 5% | 9 | slider (0-15%) |

---

## How Legacy TCO Feeds Downstream Tabs

### Expected Formula Chain

```
LEGACY TCO TAB:
  Total Annual Legacy Cost = License + Maintenance + Infrastructure
                           + (IT Support FTEs x Salary) + Customization
                           + Training + Upgrade

  Total Annual Arena Cost  = Subscription + Ongoing Admin

  One-Time Arena Cost      = Implementation + Internal Setup + Training

DOWNSTREAM (TCO Projections / Summary):
  Year 1 Legacy = Total Annual Legacy × (1 + Growth Rate)^0
  Year 1 Arena  = Total Annual Arena + One-Time Costs
  Year N Legacy = Total Annual Legacy × (1 + Growth Rate)^(N-1)
  Year N Arena  = Total Annual Arena (flat SaaS)

  Cumulative Savings = Sum(Legacy Year 1..N) - Sum(Arena Year 1..N)
  Payback Period     = Year where cumulative Arena < cumulative Legacy

  Net ROI = (Annual Benefits from Benefits Calc + Annual Legacy Savings)
            / Arena Annual Cost
```

### Cross-Tab Dependencies

```
Legacy TCO ──────────┬── TCO Projections (multi-year cost comparison chart)
                      ├── Summary / ROI tab (combined ROI = benefits + cost delta)
                      └── Executive Dashboard (payback period, 5-year NPV)

Benefits Calc (G col) ──── Summary / ROI tab (annual benefit total)
```

---

## Recommended Wizard UX

### Step Placement: New Step 9

**Rationale:** Legacy TCO is conceptually separate from the existing flow. Steps 1-5 describe the company, Steps 6-8 set benefit assumptions. Legacy TCO is a cost comparison input that should come *after* the benefits story is configured.

**Proposed Step 9 Title:** "Legacy System & Arena Investment"

### Field Groupings Within Step 9

**Group 1: "Your Current System"** (top of step)
- Dropdown: System type (sets context, could auto-suggest cost ranges)
- Currency fields: License, Maintenance, Infrastructure, Customization, Training, Upgrades
- FTE + Salary: IT Support staff

**Group 2: "Arena Investment"** (middle)
- Currency fields: Subscription, Implementation, Setup, Training, Ongoing Admin
- Visual separator between one-time and recurring costs

**Group 3: "Comparison Settings"** (bottom)
- Dropdown: 3 or 5 year comparison
- Slider: Legacy cost growth rate (0-15%)

### UI Approach

- **Simple form with currency inputs** — not sliders. Dollar amounts vary too widely for sliders.
- The system type dropdown could show contextual hints (e.g., "Typical on-premise PLM: $50K-500K/yr in license + maintenance").
- One-time vs. recurring costs should be visually distinguished (perhaps with subheadings or a light background change).
- Consider a mini-summary at the bottom: "Annual Legacy: $XXX,XXX | Annual Arena: $XXX,XXX" computed client-side.

---

## Config.gs Extension Pattern

Following the existing architecture, add a new section to `getSheetConfig()`:

```javascript
var SPREADSHEET_TABS = {
  DATA_INPUT: 'Data Input',
  BENEFITS_CALC: 'Benefits Calc',
  LEGACY_TCO: 'Legacy TCO'        // <-- add tab name
};

// Inside getSheetConfig(), add:
legacyTco: {
  tab: SPREADSHEET_TABS.LEGACY_TCO,
  writeCol: 'D',                   // verify against live sheet
  fields: [
    {
      id: 'legacySystemType',
      label: 'Current System Type',
      row: 3,                      // VERIFY
      type: 'dropdown',
      storeAs: 'text',
      step: 9,
      options: [
        'Agile PLM (Oracle)',
        'Windchill (PTC)',
        'Teamcenter (Siemens)',
        'SolidWorks PDM',
        'SharePoint / File Share',
        'Spreadsheets / Manual',
        'Other',
        'None / No System'
      ]
    },
    {
      id: 'legacyLicenseFees',
      label: 'Annual License / Subscription Fees',
      row: 5,                      // VERIFY
      type: 'currency',
      storeAs: 'currency',
      step: 9,
      default: 0,
      min: 0
    },
    // ... remaining fields follow same pattern
  ]
}
```

---

## Code.gs Changes Required

### 1. getCurrentValues() — add Legacy TCO read loop

```javascript
// Read Legacy TCO tab
var ltSheet = ss.getSheetByName(config.tabs.LEGACY_TCO);
if (ltSheet) {
  config.legacyTco.fields.forEach(function(field) {
    var cell = ltSheet.getRange(config.legacyTco.writeCol + field.row);
    var raw = cell.getValue();
    result[field.id] = convertFromSheet(raw, field.storeAs);
  });
}
```

### 2. saveWizardData() — add Legacy TCO write loop

Same pattern as Data Input write loop, targeting `legacyTco.fields`.

### 3. clearAllInputs() — add Legacy TCO clear loop

Same pattern as existing tab clears.

### 4. validateFormData() — add Legacy TCO validation

Currency fields: ensure non-negative. `tcoComparisonYears`: must be 3 or 5.

---

## SheetAudit.gs Extension

Add a third audit section after the Benefits Calc block:

```javascript
// --- Audit Legacy TCO Tab ---
report.push('');
report.push('--- LEGACY TCO TAB (' + config.tabs.LEGACY_TCO + ') ---');
var ltSheet = ss.getSheetByName(config.tabs.LEGACY_TCO);
if (!ltSheet) {
  report.push('ERROR: Tab not found: ' + config.tabs.LEGACY_TCO);
} else {
  config.legacyTco.fields.forEach(function(field) {
    var cellRef = config.legacyTco.writeCol + field.row;
    var range = ltSheet.getRange(cellRef);
    var value = range.getValue();
    var formula = range.getFormula();
    var hasFormula = formula && formula.trim() !== '';

    var status = 'OK';
    var note = '';

    if (hasFormula) {
      status = 'WARNING';
      note = 'Cell has formula: ' + formula;
      warnings.push(field.id + ' (' + cellRef + '): ' + note);
    }

    report.push('[' + status + '] ' + field.id + ' → ' + cellRef +
                ' | value: ' + JSON.stringify(value) +
                ' | storeAs: ' + field.storeAs +
                (note ? ' | NOTE: ' + note : ''));
  });
}
```

---

## Questions Requiring Manual Verification

These must be checked against the live Google Sheet before implementation:

| # | Question | How to Check |
|---|----------|-------------|
| 1 | Does a "Legacy TCO" tab exist? What is its exact name? | Open sheet, check tab names at bottom |
| 2 | What is the tab's GID? | Click tab, read `gid=XXXXXX` from URL |
| 3 | Which column has yellow input cells? (assumed D) | Visual inspection |
| 4 | What are the actual row numbers for each input? | Check row labels in columns A-C |
| 5 | Are there sections/headers between input rows? (gaps like Data Input) | Visual inspection |
| 6 | Does the dropdown for system type already exist as data validation? | Right-click cell, check Data Validation |
| 7 | What downstream tabs reference Legacy TCO cells? | Use Ctrl+` to show formulas, search for tab name |
| 8 | Are there any calculated/formula cells in the input column? | SheetAudit will catch these once wired up |
| 9 | Is there a TCO Projections or Summary tab that consumes these values? | Check all tab names |
| 10 | Does the comparison period (3 vs 5 years) live in Legacy TCO or elsewhere? | Check sheet |

---

## Implementation Priority

| Priority | Task | Depends On |
|----------|------|-----------|
| P0 | Verify tab name, GID, and actual row numbers | Live sheet access |
| P1 | Add `LEGACY_TCO` to `SPREADSHEET_TABS` and field definitions to `Config.gs` | P0 |
| P1 | Add read/write/clear loops in `Code.gs` | P1 |
| P2 | Add Step 9 UI in `_script.html` and step navigation | P1 |
| P2 | Add Step 9 styles to `_styles.html` | P1 |
| P3 | Extend SheetAudit.gs | P1 |
| P3 | Add Legacy TCO tab to Help.html | P2 |
| P4 | Update SHEET_CONFIG.md and SHEET_FORMULA_GUIDE.md | P2 |

---

## Risk Notes

- **Row number estimates are speculative.** The actual sheet may have different row numbering, section headers, or merged cells. All row numbers in the field table above are placeholders.
- **Write column may not be D.** Some TCO tabs use a different layout (e.g., side-by-side Legacy vs Arena columns). Verify before coding.
- **Dropdown type is new.** The current wizard supports `text`, `number`, `currency`, `slider`. Adding `dropdown` requires a small UI addition in `_script.html`.
- **One-time vs. recurring cost distinction** may need a `costType` field property to correctly feed the TCO projection formulas.
