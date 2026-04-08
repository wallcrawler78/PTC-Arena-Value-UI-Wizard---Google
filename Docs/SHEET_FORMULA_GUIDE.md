# Sheet Formula Guide — Arena Value Assessment

How the Google Sheet calculates ROI benefits from wizard inputs.

---

## Executive Overview

The Arena Value Assessment spreadsheet quantifies the financial impact of adopting PTC Arena PLM. Users enter company profile data and operational metrics via the wizard, which writes to the **Data Input** tab. The **Benefits Calc** tab then applies improvement percentages (also set via the wizard) to compute dollar savings for each benefit category. The result is a bottom-up ROI case built from the customer's own numbers.

Every benefit row follows the same pattern:

```
Dollar Benefit = Base Cost Pool × Improvement % × Include Toggle
```

Where:
- **Base Cost Pool** is derived from Data Input values (revenue, salaries, inventory, etc.)
- **Improvement %** is the slider value from Benefits Calc column D
- **Include Toggle** is "Yes"/"No" in Benefits Calc column F (if "No", benefit = $0)

---

## Tab Structure

### Data Input (GID: 1064609269)

| Purpose | Column |
|---------|--------|
| Row labels / descriptions | A–D |
| **User inputs (yellow cells)** | **E** |
| Derived/calculated values | Other columns (e.g., FTE defaults = E5 × role %) |

### Benefits Calc (GID: 2005510170)

| Purpose | Column |
|---------|--------|
| Benefit category labels | A–C |
| **Improvement % (user input)** | **D** |
| Improvement range reference | E |
| **Include toggle ("Yes"/"No")** | **F** |
| **Calculated dollar benefit** | **G** (sheet formulas) |

---

## Data Input Fields — Complete Reference

### Step 1: Company Profile (required)

| Cell | Field ID | Description | storeAs |
|------|----------|-------------|---------|
| E3 | `customerName` | Company name | text |
| E4 | `annualRevenue` | Annual revenue ($) | currency |
| E5 | `totalEmployees` | Total employee headcount | number |

### Step 2: Business Assumptions

| Cell | Field ID | Description | storeAs | Default |
|------|----------|-------------|---------|---------|
| E10 | `revenueGrowthRate` | Annual revenue growth rate | decimal | 10% |
| E11 | `revenueFromNewProducts` | % of revenue from new/recent products | decimal | 20% |
| E12 | `profitMarginNewProducts` | Net profit margin on new product lines | decimal | 10% |
| E15 | `npdCycleTime` | NPD/NPI cycle time in weeks | number | 52 |

### Step 3: Cost Structure

| Cell | Field ID | Description | storeAs | Default |
|------|----------|-------------|---------|---------|
| E18 | `cogsPercent` | COGS as % of revenue | decimal | 70% |
| E19 | `directMaterialPercent` | Direct material as % of COGS | decimal | 30% |
| E20 | `cmMaterialPercent` | Contract mfg material as % of COGS | decimal | 30% |
| E23 | `inventoryValue` | Total inventory value ($) | currency | 10% of revenue |
| E24 | `inventoryCarryingCost` | Annual carrying cost % | decimal | 25% |
| E27 | `expeditingCosts` | Annual expediting costs ($) | currency | 0.2% of revenue |
| E28 | `scrapRework` | Annual scrap & rework ($) | currency | 0.2% of revenue |
| E29 | `warrantyService` | Annual warranty & service costs ($) | currency | 0.2% of revenue |
| E30 | `excessObsolete` | Annual excess & obsolete inventory ($) | currency | 0.2% of revenue |

### Step 4: Team Resources

| Cell | Field ID | Description | storeAs | Default |
|------|----------|-------------|---------|---------|
| E34 | `devTeamFTEs` | Development team FTEs | number | 15% of employees |
| E35 | `devSalary` | Dev team annual salary | currency | $120,000 |
| E36 | `cadFTEs` | CAD design FTEs | number | 2% of employees |
| E37 | `cadSalary` | CAD design annual salary | currency | $120,000 |
| E38 | `engServicesFTEs` | Eng services / doc mgmt FTEs | number | 1% of employees |
| E39 | `engServicesSalary` | Eng services annual salary | currency | $120,000 |
| E40 | `pdcFTEs` | Product data consumer FTEs | number | 20% of employees |
| E41 | `pdcWorkweekPercent` | PDC % of workweek consuming data | decimal | 10% |
| E42 | `pdcSalary` | PDC annual salary | currency | $120,000 |
| E43 | `qualityFTEs` | Quality/CAPA FTEs | number | 5% of employees |
| E44 | `qualitySalary` | Quality annual salary | currency | $120,000 |
| E45 | `complianceFTEs` | Compliance FTEs | number | 2% of employees |
| E46 | `complianceSalary` | Compliance annual salary | currency | $120,000 |
| E47 | `sourcingFTEs` | Sourcing FTEs | number | 1% of employees |
| E48 | `sourcingSalary` | Sourcing annual salary | currency | $120,000 |

> **Note on `storeAs: 'decimal'`**: The wizard displays these as whole percentages (e.g., "10%") but writes them to the sheet as decimals (0.10). The conversion is `value / 100` on write, `value * 100` on read. See `toSheetValue()` and `convertFromSheet()` in Code.gs.

---

## Benefits Calc — Formula Chain

Each row in Benefits Calc computes a dollar benefit in column G. Below is the formula logic for every benefit row.

### Revenue & Time-to-Market Benefits

#### Row 2: Reduce Time to Market (10–30%)

Captures the value of launching products earlier, generating revenue sooner.

```
G2 = Annual Revenue × Revenue Growth Rate × % New Product Revenue × New Product Margin
     × (Improvement% / NPD Cycle Time in weeks) × 52

Inputs:  E4 (Revenue) × E10 (Growth) × E11 (New Product %) × E12 (Margin)
         × (BenCalc D2 / E15) × 52
```

The formula divides the improvement % by cycle time to get a per-week acceleration factor, then annualizes it. Reducing a 52-week cycle by 10% = 5.2 weeks earlier to market.

**Depends on:** E4, E10, E11, E12, E15, BenCalc D2

#### Row 4: Incremental Margin from Early Launch (1–3%)

Additional margin captured from being first/early to market.

```
G4 = Annual Revenue × % New Product Revenue × New Product Margin × Improvement%

Inputs:  E4 × E11 × E12 × BenCalc D4
```

**Depends on:** E4, E11, E12, BenCalc D4

### Material & Supply Chain Benefits

#### Row 5: Reduce Direct Material Spend (1–3%)

PLM-driven sourcing optimization reduces direct material costs.

```
G5 = Annual Revenue × COGS% × Direct Material% × Improvement%

Inputs:  E4 × E18 × E19 × BenCalc D5
```

**Depends on:** E4, E18, E19, BenCalc D5

#### Row 6: Reduce Inventory Carrying Cost (5–15%)

Better BOM accuracy and demand visibility reduce excess inventory.

```
G6 = Inventory Value × Inventory Carrying Cost% × Improvement%

Inputs:  E23 × E24 × BenCalc D6
```

**Depends on:** E23, E24, BenCalc D6

#### Row 7: Reduce CM Material Spend (3–8%)

Tighter collaboration with contract manufacturers reduces material waste.

```
G7 = Annual Revenue × COGS% × CM Material% × Improvement%

Inputs:  E4 × E18 × E20 × BenCalc D7
```

**Depends on:** E4, E18, E20, BenCalc D7

### Labor Efficiency Benefits

All labor rows follow this pattern:

```
G[row] = FTE Count × Annual Salary × Improvement%
```

Where FTE Count is entered directly (the wizard computes defaults as `Total Employees × role %`).

#### Row 8: Development Team Efficiency (1–5%)

```
G8 = Dev FTEs × Dev Salary × Improvement%

Inputs:  E34 × E35 × BenCalc D8
```

**Depends on:** E34, E35, BenCalc D8

#### Row 9: Eng Services / Doc Mgmt Efficiency (15–65%)

```
G9 = Eng Services FTEs × Eng Services Salary × Improvement%

Inputs:  E38 × E39 × BenCalc D9
```

**Depends on:** E38, E39, BenCalc D9

#### Row 10: Product Data Consumer Efficiency (18–90%)

This role has an extra factor: the % of their workweek spent consuming product data.

```
G10 = PDC FTEs × PDC Workweek% × PDC Salary × Improvement%

Inputs:  E40 × E41 × E42 × BenCalc D10
```

**Depends on:** E40, E41, E42, BenCalc D10

#### Row 11: CAD Design Efficiency (1–3%)

```
G11 = CAD FTEs × CAD Salary × Improvement%

Inputs:  E36 × E37 × BenCalc D11
```

**Depends on:** E36, E37, BenCalc D11

#### Row 12: Quality/CAPA Efficiency (4–20%)

```
G12 = Quality FTEs × Quality Salary × Improvement%

Inputs:  E43 × E44 × BenCalc D12
```

**Depends on:** E43, E44, BenCalc D12

#### Row 13: Compliance Efficiency (2–20%)

```
G13 = Compliance FTEs × Compliance Salary × Improvement%

Inputs:  E45 × E46 × BenCalc D13
```

**Depends on:** E45, E46, BenCalc D13

#### Row 14: Sourcing Efficiency (3–10%)

```
G14 = Sourcing FTEs × Sourcing Salary × Improvement%

Inputs:  E47 × E48 × BenCalc D14
```

**Depends on:** E47, E48, BenCalc D14

### Cost Recovery Benefits

These rows apply improvement percentages directly to known annual cost pools.

#### Row 15: Reduce Expediting Costs (6–25%)

```
G15 = Annual Expediting Costs × Improvement%

Inputs:  E27 × BenCalc D15
```

**Depends on:** E27, BenCalc D15

#### Row 16: Reduce Scrap & Rework (5–15%)

```
G16 = Annual Scrap & Rework × Improvement%

Inputs:  D28 × BenCalc D16
```

**Depends on:** D28, BenCalc D16

#### Row 17: Reduce Warranty & Service (10–20%)

```
G17 = Annual Warranty & Service × Improvement%

Inputs:  E29 × BenCalc D17
```

**Depends on:** E29, BenCalc D17

#### Row 18: Non-Compliance Cost Avoidance (1–5%)

Estimated cost of regulatory non-compliance events, scaled by revenue.

```
G18 = Annual Revenue × Compliance Risk Factor × Improvement%

Inputs:  E4 × (compliance base rate) × BenCalc D18
```

**Depends on:** E4, BenCalc D18

#### Row 19: Reduce End of Life Costs (6–25%)

```
G19 = Annual Excess & Obsolete × Improvement%

Inputs:  E30 × BenCalc D19
```

**Depends on:** E30, BenCalc D19

---

## Sample Calculation Walkthrough

**Scenario:** $50M revenue, 250 employees, all defaults.

### Data Input Values (defaults applied)

| Field | Value | Sheet Cell |
|-------|-------|------------|
| Annual Revenue | $50,000,000 | E4 |
| Total Employees | 250 | E5 |
| Revenue Growth Rate | 10% (stored 0.10) | E10 |
| % Revenue New Products | 20% (stored 0.20) | E11 |
| Profit Margin New Products | 10% (stored 0.10) | E12 |
| NPD Cycle Time | 52 weeks | E15 |
| COGS % | 70% (stored 0.70) | E18 |
| Direct Material % | 30% (stored 0.30) | E19 |
| CM Material % | 30% (stored 0.30) | E20 |
| Inventory Value | $5,000,000 (10% of rev) | E23 |
| Inventory Carrying Cost | 25% (stored 0.25) | E24 |
| Expediting Costs | $100,000 (0.2% of rev) | E27 |
| Scrap & Rework | $100,000 | E28 |
| Warranty & Service | $100,000 | E29 |
| Excess & Obsolete | $100,000 | E30 |
| Dev Team FTEs | 38 (15% of 250) | E34 |
| Dev Salary | $120,000 | E35 |
| CAD FTEs | 5 (2% of 250) | E36 |
| CAD Salary | $120,000 | E37 |
| Eng Services FTEs | 3 (1% of 250) | E38 |
| Eng Services Salary | $120,000 | E39 |
| PDC FTEs | 50 (20% of 250) | E40 |
| PDC Workweek % | 10% (stored 0.10) | E41 |
| PDC Salary | $120,000 | E42 |
| Quality FTEs | 13 (5% of 250) | E43 |
| Quality Salary | $120,000 | E44 |
| Compliance FTEs | 5 (2% of 250) | E45 |
| Compliance Salary | $120,000 | E46 |
| Sourcing FTEs | 3 (1% of 250) | E47 |
| Sourcing Salary | $120,000 | E48 |

### Benefits Calc (all at default improvement %, all included)

| Row | Benefit | Improvement | Calculation | Dollar Benefit |
|-----|---------|-------------|-------------|----------------|
| 2 | Reduce TTM | 10% | $50M × 0.10 × 0.20 × 0.10 × (0.10/52) × 52 = $100K × 0.10 | **$10,000** |
| 4 | Incremental Margin | 1% | $50M × 0.20 × 0.10 × 0.01 | **$10,000** |
| 5 | Reduce Direct Material | 1% | $50M × 0.70 × 0.30 × 0.01 | **$105,000** |
| 6 | Reduce Inventory Carrying | 5% | $5M × 0.25 × 0.05 | **$62,500** |
| 7 | Reduce CM Material | 5% | $50M × 0.70 × 0.30 × 0.05 | **$525,000** |
| 8 | Dev Team Efficiency | 1% | 38 × $120K × 0.01 | **$45,600** |
| 9 | Eng Services Efficiency | 15% | 3 × $120K × 0.15 | **$54,000** |
| 10 | PDC Efficiency | 18% | 50 × 0.10 × $120K × 0.18 | **$108,000** |
| 11 | CAD Efficiency | 1% | 5 × $120K × 0.01 | **$6,000** |
| 12 | Quality Efficiency | 4% | 13 × $120K × 0.04 | **$62,400** |
| 13 | Compliance Efficiency | 2% | 5 × $120K × 0.02 | **$12,000** |
| 14 | Sourcing Efficiency | 3% | 3 × $120K × 0.03 | **$10,800** |
| 15 | Reduce Expediting | 6% | $100K × 0.06 | **$6,000** |
| 16 | Reduce Scrap & Rework | 5% | $100K × 0.05 | **$5,000** |
| 17 | Reduce Warranty | 10% | $100K × 0.10 | **$10,000** |
| 18 | Non-Compliance Avoidance | 1% | $50M × base rate × 0.01 | **~$5,000** |
| 19 | Reduce EOL Costs | 6% | $100K × 0.06 | **$6,000** |
| | | | **Approximate Total** | **~$1,043,300** |

> Actual sheet totals may vary slightly depending on rounding and the non-compliance base rate formula.

---

## Dependency Map

Which Data Input cells affect which Benefits Calc rows:

```
E4  (Annual Revenue) ──────┬── Row 2  (TTM)
                           ├── Row 4  (Incremental Margin)
                           ├── Row 5  (Direct Material)
                           ├── Row 7  (CM Material)
                           └── Row 18 (Non-Compliance)

E5  (Total Employees) ────── Used to compute default FTE counts
                             (not directly in benefit formulas;
                              FTE counts are entered as separate fields)

E10 (Revenue Growth) ─────── Row 2  (TTM)
E11 (New Product %) ──────┬── Row 2  (TTM)
                          └── Row 4  (Incremental Margin)
E12 (New Product Margin) ─┬── Row 2  (TTM)
                          └── Row 4  (Incremental Margin)
E15 (NPD Cycle Time) ─────── Row 2  (TTM)

E18 (COGS %) ─────────────┬── Row 5  (Direct Material)
                           └── Row 7  (CM Material)
E19 (Direct Material %) ───── Row 5  (Direct Material)
E20 (CM Material %) ──────── Row 7  (CM Material)

E23 (Inventory Value) ────── Row 6  (Inventory Carrying)
E24 (Carrying Cost %) ────── Row 6  (Inventory Carrying)

E27 (Expediting Costs) ───── Row 15 (Expediting)
E28 (Scrap & Rework) ─────── Row 16 (Scrap & Rework)
E29 (Warranty & Service) ─── Row 17 (Warranty)
E30 (Excess & Obsolete) ──── Row 19 (EOL Costs)

E34 (Dev FTEs) ────────────── Row 8  (Dev Efficiency)
E35 (Dev Salary) ──────────── Row 8  (Dev Efficiency)
E36 (CAD FTEs) ────────────── Row 11 (CAD Efficiency)
E37 (CAD Salary) ──────────── Row 11 (CAD Efficiency)
E38 (Eng Services FTEs) ───── Row 9  (Eng Services Efficiency)
E39 (Eng Services Salary) ─── Row 9  (Eng Services Efficiency)
E40 (PDC FTEs) ────────────── Row 10 (PDC Efficiency)
E41 (PDC Workweek %) ──────── Row 10 (PDC Efficiency)
E42 (PDC Salary) ──────────── Row 10 (PDC Efficiency)
E43 (Quality FTEs) ────────── Row 12 (Quality Efficiency)
E44 (Quality Salary) ──────── Row 12 (Quality Efficiency)
E45 (Compliance FTEs) ─────── Row 13 (Compliance Efficiency)
E46 (Compliance Salary) ───── Row 13 (Compliance Efficiency)
E47 (Sourcing FTEs) ───────── Row 14 (Sourcing Efficiency)
E48 (Sourcing Salary) ─────── Row 14 (Sourcing Efficiency)
```

---

## storeAs Conversion Reference

The wizard displays user-friendly values; the sheet stores raw values. The conversion happens in `Code.gs`:

| storeAs | Wizard Display | Sheet Value | Write Function | Read Function |
|---------|---------------|-------------|----------------|---------------|
| `text` | "Acme Corp" | "Acme Corp" | as-is | as-is |
| `number` | 250 | 250 | `parseFloat()` | as-is |
| `currency` | 50000000 | 50000000 | strip non-numeric, `parseFloat()` | as-is |
| `decimal` | 10 (meaning 10%) | 0.10 | `value / 100` | `value * 100` |

**Important:** All improvement percentages in Benefits Calc column D use `storeAs: 'decimal'`. When the wizard shows "10%", the sheet stores `0.10`. The benefit formulas in column G use the decimal form directly.

---

## Column F: Include Toggle

Each Benefits Calc row has a "Yes"/"No" string in column F. When "No", the sheet formula zeros out the benefit for that row. The wizard writes this as a string literal, not a boolean.

```
If F[row] = "Yes" → G[row] = calculated benefit
If F[row] = "No"  → G[row] = 0
```

---

## How the Wizard Writes Data

1. User fills out wizard steps (company profile, assumptions, costs, workforce, benefit sliders)
2. On submit, `saveWizardData()` in Code.gs iterates all fields from `Config.gs`
3. Data Input fields → written to `E{row}` on the Data Input tab
4. Benefits Calc fields → improvement % written to `D{row}`, include toggle written to `F{row}`
5. `SpreadsheetApp.flush()` forces recalculation
6. Sheet formulas in column G automatically recompute all dollar benefits

All cell references are defined in `Config.gs` — no hardcoded references exist in Code.gs or the HTML files.
