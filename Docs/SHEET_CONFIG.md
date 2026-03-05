# Sheet Configuration Reference

All cell mappings live in **`Config.gs`** → `getSheetConfig()`. This file is the single source of truth. Do not hardcode cell references anywhere else.

---

## Tab Names

| Constant | Tab Name |
|----------|----------|
| `SPREADSHEET_TABS.DATA_INPUT` | `Data Input` |
| `SPREADSHEET_TABS.BENEFITS_CALC` | `Benefits Calc` |
| `SPREADSHEET_TABS.LEGACY_TCO` | `Legacy TCO` |

---

## Data Input Tab (GID: 1064609269) — writes to column D

| Field ID | Row | Label | Store As | Default |
|----------|-----|-------|----------|---------|
| `customerName` | D3 | Customer Name | text | (required) |
| `annualRevenue` | D4 | Annual Revenue | currency | (required) |
| `totalEmployees` | D5 | Total Employees | number | (required) |
| `revenueGrowthRate` | D10 | Revenue Growth Rate | decimal | 10% |
| `revenueFromNewProducts` | D11 | % Revenue from New Products | decimal | 20% |
| `profitMarginNewProducts` | D12 | Profit Margin on New Products | decimal | 10% |
| `npdCycleTime` | D15 | NPD/NPI Cycle Time (weeks) | number | 52 |
| `cogsPercent` | D18 | COGS as % of Revenue | decimal | 70% |
| `directMaterialPercent` | D19 | Direct Material % of COGS | decimal | 30% |
| `cmMaterialPercent` | D20 | CM Material % of COGS | decimal | 30% |
| `inventoryValue` | D23 | Inventory Value | currency | 10% of Revenue |
| `inventoryCarryingCost` | D24 | Inventory Carrying Cost % | decimal | 25% |
| `expeditingCosts` | D27 | Annual Expediting Costs | currency | 0.2% of Revenue |
| `scrapRework` | D28 | Annual Scrap & Rework | currency | 0.2% of Revenue |
| `warrantyService` | D29 | Annual Warranty & Service | currency | 0.2% of Revenue |
| `excessObsolete` | D30 | Annual Excess & Obsolete | currency | 0.2% of Revenue |
| `devTeamFTEs` | D34 | Development Team FTEs | number | 15% of employees |
| `devSalary` | D35 | Development Team Salary | currency | $120,000 |
| `cadFTEs` | D36 | CAD Design FTEs | number | 2% of employees |
| `cadSalary` | D37 | CAD Design Salary | currency | $120,000 |
| `engServicesFTEs` | D38 | Eng Services FTEs | number | 1% of employees |
| `engServicesSalary` | D39 | Eng Services Salary | currency | $120,000 |
| `pdcFTEs` | D40 | Product Data Consumer FTEs | number | 20% of employees |
| `pdcWorkweekPercent` | D41 | PDC % Workweek | decimal | 10% |
| `pdcSalary` | D42 | PDC Salary | currency | $120,000 |
| `qualityFTEs` | D43 | Quality/CAPA FTEs | number | 5% of employees |
| `qualitySalary` | D44 | Quality Salary | currency | $120,000 |
| `complianceFTEs` | D45 | Compliance FTEs | number | 2% of employees |
| `complianceSalary` | D46 | Compliance Salary | currency | $120,000 |
| `sourcingFTEs` | D47 | Sourcing FTEs | number | 1% of employees |
| `sourcingSalary` | D48 | Sourcing Salary | currency | $120,000 |

### `storeAs` Values

| Value | Meaning |
|-------|---------|
| `text` | Written as string |
| `number` | Written as integer/float |
| `decimal` | Wizard value ÷ 100 before writing (e.g., 10% → 0.10) |
| `currency` | Written as plain number (no formatting) |

---

## Benefits Calc Tab (GID: 2005510170) — writes to column D (%) and column F (Yes/No)

| Field ID | Row | Label | Range | Default |
|----------|-----|-------|-------|---------|
| `reduceTimeToMarket` | 2 | Reduce Time to Market | 10–30% | 10% |
| `incrementalMargin` | 4 | Incremental Margin from Early Launch | 1–3% | 1% |
| `reduceDirectMaterial` | 5 | Reduce Direct Material Spend | 1–3% | 1% |
| `reduceInventoryCarrying` | 6 | Reduce Inventory Carrying Cost | 5–15% | 5% |
| `reduceCMMaterial` | 7 | Reduce CM Material Spend | 3–8% | 5% |
| `devTeamEfficiency` | 8 | Development Team Efficiency | 1–5% | 1% |
| `engServicesEfficiency` | 9 | Eng Services Efficiency | 15–65% | 15% |
| `pdcEfficiency` | 10 | Product Data Consumer Efficiency | 18–90% | 18% |
| `cadEfficiency` | 11 | CAD Design Efficiency | 1–3% | 1% |
| `qualityEfficiency` | 12 | Quality/CAPA Efficiency | 4–20% | 4% |
| `complianceEfficiency` | 13 | Compliance Efficiency | 2–20% | 2% |
| `sourcingEfficiency` | 14 | Sourcing Efficiency | 3–10% | 3% |
| `reduceExpediting` | 15 | Reduce Expediting Costs | 6–25% | 6% |
| `reduceScrapRework` | 16 | Reduce Scrap & Rework | 5–15% | 5% |
| `reduceWarranty` | 17 | Reduce Warranty & Service | 10–20% | 10% |
| `nonComplianceAvoidance` | 18 | Non-Compliance Cost Avoidance | 1–5% | 1% |
| `reduceEOL` | 19 | Reduce End of Life Costs | 6–25% | 6% |

Column F values: `"Yes"` or `"No"` (string, matching existing sheet format).

---

## Legacy TCO Tab — writes to column D

> **Row numbers are ESTIMATES — verify against the live sheet before production use.**

| Field ID | Row | Label | Store As | Default |
|----------|-----|-------|----------|---------|
| `legacyLicenseCost` | D4 | Current PLM/PDM Annual License Cost | currency | — |
| `legacyITCost` | D5 | Annual IT Infrastructure & Support | currency | — |
| `legacyTrainingMaintCost` | D6 | Annual Training & Maintenance | currency | — |
| `legacyIntegrationCost` | D7 | Annual Integration & Customization | currency | — |
| `arenaSubscriptionCost` | D11 | Arena Annual Subscription Cost | currency | — |
| `arenaImplementationCost` | D12 | Arena Implementation Cost | currency | — |
| `arenaTrainingCost` | D13 | Arena Training & Onboarding | currency | — |
| `tcoYears` | D17 | TCO Comparison Period (years) | number | 3 |

---

## How to Update Cell References

1. Open `Config.gs`.
2. Find the field by `id`.
3. Update the `row` property to the new row number.
4. If the write column changes, update `dataInput.writeCol` or `benefitsCalc.improvementCol` / `benefitsCalc.includeCol`.
5. `clasp push` to deploy.

**No changes needed in any other file.**
