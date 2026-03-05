# UI Audit: Config.gs vs Sheet Structure

Audit date: 2026-03-05

## Summary

**Total fields audited:** 49 (31 Data Input + 18 Benefits Calc)
**Issues found:** 1 confirmed fix, 7 fields flagged for manual verification

---

## Data Input Fields

| Field ID | Row | storeAs | type | required | default | Result |
|----------|-----|---------|------|----------|---------|--------|
| `customerName` | 3 | text | text | yes | - | PASS |
| `annualRevenue` | 4 | currency | currency | yes | - | PASS |
| `totalEmployees` | 5 | number | number | yes | - | PASS |
| `revenueGrowthRate` | 10 | decimal | slider | no | 10 | PASS |
| `revenueFromNewProducts` | 11 | decimal | slider | no | 20 | PASS |
| `profitMarginNewProducts` | 12 | decimal | slider | no | 10 | PASS |
| `npdCycleTime` | 15 | number | slider | no | 52 | PASS |
| `cogsPercent` | 18 | decimal | slider | no | 70 | PASS |
| `directMaterialPercent` | 19 | decimal | slider | no | 30 | PASS |
| `cmMaterialPercent` | 20 | decimal | slider | no | 30 | PASS |
| `inventoryValue` | 23 | currency | currency | no | null | PASS |
| `inventoryCarryingCost` | 24 | decimal | slider | no | 25 | PASS |
| `expeditingCosts` | 27 | currency | currency | no | null | PASS |
| `scrapRework` | 28 | currency | currency | no | null | PASS |
| `warrantyService` | 29 | currency | currency | no | null | PASS |
| `excessObsolete` | 30 | currency | currency | no | null | PASS |
| `devTeamFTEs` | 34 | number | number | no | null | NEEDS-MANUAL-VERIFY |
| `devSalary` | 35 | currency | currency | no | 120000 | PASS |
| `cadFTEs` | 36 | number | number | no | null | NEEDS-MANUAL-VERIFY |
| `cadSalary` | 37 | currency | currency | no | 120000 | PASS |
| `engServicesFTEs` | 38 | number | number | no | null | NEEDS-MANUAL-VERIFY |
| `engServicesSalary` | 39 | currency | currency | no | 120000 | PASS |
| `pdcFTEs` | 40 | number | number | no | null | NEEDS-MANUAL-VERIFY |
| `pdcWorkweekPercent` | 41 | decimal | slider | no | 10 | PASS |
| `pdcSalary` | 42 | currency | currency | no | 120000 | PASS |
| `qualityFTEs` | 43 | number | number | no | null | NEEDS-MANUAL-VERIFY |
| `qualitySalary` | 44 | currency | currency | no | 120000 | PASS |
| `complianceFTEs` | 45 | number | number | no | null | NEEDS-MANUAL-VERIFY |
| `complianceSalary` | 46 | currency | currency | no | 120000 | PASS |
| `sourcingFTEs` | 47 | number | number | no | null | NEEDS-MANUAL-VERIFY |
| `sourcingSalary` | 48 | currency | currency | no | 120000 | PASS |

---

## Benefits Calc Fields

| Field ID | Row | storeAs | min | max | default | defaultInclude | Result |
|----------|-----|---------|-----|-----|---------|----------------|--------|
| `reduceTimeToMarket` | 2 | decimal | 10 | 30 | 10 | true | PASS |
| *(Row 3 — blank, no field mapped)* | 3 | - | - | - | - | - | PASS |
| `incrementalMargin` | 4 | decimal | 1 | 3 | 1 | true | PASS |
| `reduceDirectMaterial` | 5 | decimal | 1 | 3 | 1 | true | PASS |
| `reduceInventoryCarrying` | 6 | decimal | 5 | 15 | 5 | true | PASS |
| `reduceCMMaterial` | 7 | decimal | 3 | 8 | 3 | true | **FIXED** |
| `devTeamEfficiency` | 8 | decimal | 1 | 5 | 1 | true | PASS |
| `engServicesEfficiency` | 9 | decimal | 15 | 65 | 15 | true | PASS |
| `pdcEfficiency` | 10 | decimal | 18 | 90 | 18 | true | PASS |
| `cadEfficiency` | 11 | decimal | 1 | 3 | 1 | true | PASS |
| `qualityEfficiency` | 12 | decimal | 4 | 20 | 4 | true | PASS |
| `complianceEfficiency` | 13 | decimal | 2 | 20 | 2 | true | PASS |
| `sourcingEfficiency` | 14 | decimal | 3 | 10 | 3 | true | PASS |
| `reduceExpediting` | 15 | decimal | 6 | 25 | 6 | true | PASS |
| `reduceScrapRework` | 16 | decimal | 5 | 15 | 5 | true | PASS |
| `reduceWarranty` | 17 | decimal | 10 | 20 | 10 | true | PASS |
| `nonComplianceAvoidance` | 18 | decimal | 1 | 5 | 1 | true | PASS |
| `reduceEOL` | 19 | decimal | 6 | 25 | 6 | true | PASS |

---

## Maturity Level pct Values (all within min/max)

| Field | Range | Maturity pcts | Result |
|-------|-------|---------------|--------|
| `reduceTimeToMarket` | 10-30 | 10, 17, 23, 30 | PASS |
| `incrementalMargin` | 1-3 | 1, 1.5, 2.5, 3 | PASS |
| `reduceDirectMaterial` | 1-3 | 1, 1.5, 2.5, 3 | PASS |
| `reduceInventoryCarrying` | 5-15 | 5, 8, 12, 15 | PASS |
| `reduceCMMaterial` | 3-8 | 3, 5, 6.5, 8 | PASS |
| `devTeamEfficiency` | 1-5 | 1, 2, 3.5, 5 | PASS |
| `engServicesEfficiency` | 15-65 | 15, 28, 50, 65 | PASS |
| `pdcEfficiency` | 18-90 | 18, 38, 65, 90 | PASS |
| `cadEfficiency` | 1-3 | 1, 1.5, 2.5, 3 | PASS |
| `qualityEfficiency` | 4-20 | 4, 9, 14, 20 | PASS |
| `complianceEfficiency` | 2-20 | 2, 7, 14, 20 | PASS |
| `sourcingEfficiency` | 3-10 | 3, 5, 7.5, 10 | PASS |
| `reduceExpediting` | 6-25 | 6, 12, 19, 25 | PASS |
| `reduceScrapRework` | 5-15 | 5, 8, 12, 15 | PASS |
| `reduceWarranty` | 10-20 | 10, 13, 17, 20 | PASS |
| `nonComplianceAvoidance` | 1-5 | 1, 2, 3.5, 5 | PASS |
| `reduceEOL` | 6-25 | 6, 12, 19, 25 | PASS |

---

## Specific Checks

| Check | Result |
|-------|--------|
| No Benefits Calc field maps to Row 3 (blank row) | PASS |
| All salary fields use storeAs `currency` (not `decimal`) | PASS (7/7) |
| NPD cycle time (D15) uses storeAs `number` (not `decimal`) | PASS |
| Slider step sizes reasonable for all ranges | PASS |
| pdcWorkweekPercent uses storeAs `decimal` | PASS |

---

## Issues Fixed

### 1. `reduceCMMaterial` default was 5, should be 3

- **File:** `Config.gs`, line ~553
- **Was:** `default: 5`
- **Now:** `default: 3`
- **Why:** Ground truth specifies default of 3% for "Reduce CM Material Spend" (range 3-8%). The previous value of 5 was above the minimum, meaning users would not start at the conservative end of the range as intended.

---

## Items Requiring Manual Verification

### FTE Fields: `storeAs` — number vs decimal

**Affected fields:** `devTeamFTEs` (D34), `cadFTEs` (D36), `engServicesFTEs` (D38), `pdcFTEs` (D40), `qualityFTEs` (D43), `complianceFTEs` (D45), `sourcingFTEs` (D47)

**Conflict:** The ground truth states these should be `storeAs: 'decimal'` (storing a percentage of total employees as a decimal, e.g. 15% -> 0.15). However:

1. **Config.gs** currently has `storeAs: 'number'` for all 7 FTE fields
2. **SHEET_CONFIG.md** (project documentation) also lists these as `number`
3. **Wizard UI** renders these in a table with column header "# of FTEs" and number inputs (no % indicator)
4. The `buildTableInput` function creates `<input type="number">` with no unit suffix

If the live sheet stores FTE values as decimal percentages (0.15 for 15%), then:
- Config.gs needs `storeAs: 'decimal'` on all 7 FTE fields
- The wizard UI needs updating (labels, % indicators)
- The `type` should change from `number` to `slider` or include `unit: '%'`

If the live sheet stores actual headcounts (e.g., 50), then:
- Current `storeAs: 'number'` is correct
- The ground truth description may reflect default calculation logic rather than storage format

**Action needed:** Open the live spreadsheet and check cells D34, D36, D38, D40, D43, D45, D47 to determine if they contain decimal percentages (like 0.15) or integer headcounts (like 50). Fix Config.gs and the wizard UI accordingly.

---

## Architecture Notes (no issues)

- `getWizardConfig()` correctly passes both `dataInputFields` and `benefitsFields` to the client
- `toSheetValue()` and `convertFromSheet()` correctly handle all storeAs types
- `validateFormData()` checks required fields and benefit ranges correctly
- `clearAllInputs()` clears both tabs using the same config
- No row 3 is mapped in benefits — correctly skips the blank row
- All 18 benefits have `defaultInclude: true` which is correct baseline behavior
