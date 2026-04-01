# Sheet Configuration Reference

All cell mappings live in **`Config.gs`** → `getSheetConfig()`. This file is the single source of truth. Do not hardcode cell references anywhere else.

Last verified: 2026-04-01 via code review (Docs/CODE_REVIEW.md)

---

## Tab Names

| Constant | Tab Name |
|----------|----------|
| `SPREADSHEET_TABS.DATA_INPUT` | `Data Input` |
| `SPREADSHEET_TABS.BENEFITS_CALC` | `Benefits Calc` |
| `SPREADSHEET_TABS.LEGACY_TCO` | `Legacy TCO` |

---

## Data Input Tab — writes to column **E**

`writeCol: 'E'` in Config.gs. Rows have gaps between sections (header/label rows in the sheet are not written by the wizard).

| Field ID | Cell | Label | Store As | Default | Step |
|----------|------|-------|----------|---------|------|
| `customerName` | E3 | Customer Name | text | (required) | 1 |
| `annualRevenue` | E4 | Annual Revenue | currency | (required) | 1 |
| `totalEmployees` | E5 | Total Employees | number | (required) | 1 |
| `revenueGrowthRate` | E10 | Revenue Growth Rate | decimal | 10% | 2 |
| `revenueFromNewProducts` | E11 | % Revenue from New Products | decimal | 20% | 2 |
| `profitMarginNewProducts` | E12 | Profit Margin on New Products | decimal | 10% | 2 |
| `npdCycleTime` | E15 | NPD/NPI Cycle Time (weeks) | number | 52 | 2 |
| `cogsPercent` | E18 | COGS as % of Revenue | decimal | 70% | 3 |
| `directMaterialPercent` | E19 | Direct Material % of COGS | decimal | 30% | 3 |
| `cmMaterialPercent` | E20 | CM Material % of COGS | decimal | 30% | 3 |
| `inventoryValue` | E23 | Inventory Value | currency | 10% of Revenue* | 3 |
| `inventoryCarryingCost` | E24 | Inventory Carrying Cost % | decimal | 25% | 3 |
| `expeditingCosts` | E27 | Annual Expediting Costs | currency | 0.2% of Revenue* | 3 |
| `scrapRework` | E28 | Annual Scrap & Rework | currency | 0.2% of Revenue* | 3 |
| `warrantyService` | E29 | Annual Warranty & Service | currency | 0.2% of Revenue* | 3 |
| `excessObsolete` | E30 | Annual Excess & Obsolete | currency | 0.2% of Revenue* | 3 |
| `devTeamFTEs` | E34 | Development Team FTEs | number | 15% of employees† | 4 |
| `devSalary` | E35 | Development Team Salary | currency | $120,000 | 4 |
| `cadFTEs` | E36 | CAD Design FTEs | number | 2% of employees† | 4 |
| `cadSalary` | E37 | CAD Design Salary | currency | $120,000 | 4 |
| `engServicesFTEs` | E38 | Eng Services FTEs | number | 1% of employees† | 4 |
| `engServicesSalary` | E39 | Eng Services Salary | currency | $120,000 | 4 |
| `pdcFTEs` | E40 | Product Data Consumer FTEs | number | 20% of employees† | 4 |
| `pdcWorkweekPercent` | E41 | PDC % Workweek Consuming Data | decimal | 10% | 4 |
| `pdcSalary` | E42 | PDC Salary | currency | $120,000 | 4 |
| `qualityFTEs` | E43 | Quality/CAPA FTEs | number | 5% of employees† | 4 |
| `qualitySalary` | E44 | Quality Salary | currency | $120,000 | 4 |
| `complianceFTEs` | E45 | Compliance FTEs | number | 2% of employees† | 4 |
| `complianceSalary` | E46 | Compliance Salary | currency | $120,000 | 4 |
| `sourcingFTEs` | E47 | Sourcing FTEs | number | 1% of employees† | 4 |
| `sourcingSalary` | E48 | Sourcing Salary | currency | $120,000 | 4 |

\* Auto-calculated client-side from Annual Revenue when field is empty (never overwrites user input).  
† Auto-calculated client-side from Total Employees when field is empty (never overwrites user input).  
⚠️ **FTE storeAs NEEDS MANUAL VERIFY** — see UI_AUDIT.md. If live sheet stores headcounts (e.g. 50), current `number` is correct. If it stores decimal fractions (e.g. 0.15), change to `decimal`.

### `storeAs` Values

| Value | Write to sheet | Read from sheet |
|-------|---------------|-----------------|
| `text` | String as-is | As-is |
| `number` | parseFloat | As-is |
| `decimal` | value ÷ 100 (wizard 10% → sheet 0.10) | value × 100 (sheet 0.10 → wizard 10) |
| `currency` | parseFloat (strips non-numeric chars) | As-is |

---

## Benefits Calc Tab — writes to columns **D** and **F**

- `improvementCol: 'D'` — stores decimal (e.g. 0.10 for 10%)
- `includeCol: 'F'` — stores `"Yes"` or `"No"` (string)
- Row 3 is intentionally blank in the sheet — no wizard field maps to it.

| Field ID | Row | Label | Range | Default | Step |
|----------|-----|-------|-------|---------|------|
| `reduceTimeToMarket` | 2 | Reduce Time to Market | 10–30% | 10% | 5 |
| *(blank row)* | 3 | — | — | — | — |
| `incrementalMargin` | 4 | Incremental Margin from Early Launch | 1–3% | 1% | 5 |
| `reduceDirectMaterial` | 5 | Reduce Direct Material Spend | 1–3% | 1% | 5 |
| `reduceInventoryCarrying` | 6 | Reduce Inventory Carrying Cost | 5–15% | 5% | 5 |
| `reduceCMMaterial` | 7 | Reduce CM Material Spend | 3–8% | 3% | 5 |
| `devTeamEfficiency` | 8 | Development Team Efficiency | 1–5% | 1% | 6 |
| `engServicesEfficiency` | 9 | Eng Services Efficiency | 15–65% | 15% | 6 |
| `pdcEfficiency` | 10 | Product Data Consumer Efficiency | 18–90% | 18% | 6 |
| `cadEfficiency` | 11 | CAD Design Efficiency | 1–3% | 1% | 6 |
| `qualityEfficiency` | 12 | Quality/CAPA Efficiency | 4–20% | 4% | 6 |
| `complianceEfficiency` | 13 | Compliance Efficiency | 2–20% | 2% | 6 |
| `sourcingEfficiency` | 14 | Sourcing Efficiency | 3–10% | 3% | 6 |
| `reduceExpediting` | 15 | Reduce Expediting Costs | 6–25% | 6% | 7 |
| `reduceScrapRework` | 16 | Reduce Scrap & Rework | 5–15% | 5% | 7 |
| `reduceWarranty` | 17 | Reduce Warranty & Service | 10–20% | 10% | 7 |
| `nonComplianceAvoidance` | 18 | Non-Compliance Cost Avoidance | 1–5% | 1% | 7 |
| `reduceEOL` | 19 | Reduce End of Life Costs | 6–25% | 6% | 7 |

All 18 benefits have `defaultInclude: true`. Column F receives `"Yes"` or `"No"` regardless of whether an improvement value was entered.

---

## Legacy TCO Tab — writes to columns **C**, **D**, **F**, and cell **E3**

Structure (confirmed via SheetAudit):
- `unitCostCol: 'C'` — annual unit cost ($) per line item
- `qtyCol: 'D'` — quantity or rate multiplier per line item
- `includeCol: 'F'` — `"Yes"` or `"No"` per line item
- `onPremCell: 'E3'` — on-premises/perpetual license toggle (`"Yes"` or `"No"`)

Row 4 is the header row. Data rows are 5–11.

| Field ID | Row | Label | Unit Cost | Qty Label | Qty storeAs | Qty Default | Incl. Default | Step |
|----------|-----|-------|-----------|-----------|-------------|-------------|---------------|------|
| `legacySoftware` | 5 | PLM/QMS License / Subscriptions | Per-seat annual fee ($) | # of users/seats | number | — | No | 8 |
| `legacySoftwareSupport` | 6 | Annual Support & Maintenance | Support cost ($) | % of license cost | decimal | 20% | Yes | 8 |
| `legacyIntegrations` | 7 | CAD, ERP & Other Connectors | Per-connector annual cost ($) | Count | number | 1 | Yes | 8 |
| `legacyInfrastructure` | 8 | Hosting, Backup & Security | Infrastructure cost ($) | % of license cost | decimal | 10% | Yes | 8 |
| `legacyMaintenance` | 9 | IT Resources & Labor | IT labor cost ($) | % of infra cost | decimal | 10% | Yes | 8 |
| `legacyUpgrades` | 10 | Hardware, Software & Training | Annual upgrade cost ($) | Count | number | 1 | Yes | 8 |
| `legacyOtherSubs` | 11 | Other Subscriptions | Per-subscription cost ($) | Count | number | 1 | Yes | 8 |

**Sheet formula:** `G12` sums all included rows: `unitCost × qty` (qty in decimal units for `decimal` storeAs rows).

**TCO calculation:** `unitCost × qty` where:
- `number` qty: raw count (e.g. 10 seats)
- `decimal` qty: percentage as multiplier (wizard value 20 → stored as 0.20 → unitCost × 0.20)

---

## How to Update Cell References

1. Open `Config.gs`.
2. Find the field by `id`.
3. Update the `row` property.
4. If the write column changes, update `dataInput.writeCol`, `benefitsCalc.improvementCol` / `benefitsCalc.includeCol`, or `legacyTco.unitCostCol` / `legacyTco.qtyCol` / `legacyTco.includeCol`.
5. `clasp push` to deploy.
6. Run `runSheetAudit()` from the Apps Script editor to verify alignment.

**No changes needed in any other file.**
