# Sheet Audit Guide

## What SheetAudit.gs Does

`SheetAudit.gs` is a diagnostic script that reads the live Google Sheet and logs a detailed audit report. It verifies that every wizard field in `Config.gs` maps correctly to the expected spreadsheet cells, checking both the **Data Input** and **Benefits Calc** tabs.

Specifically, it:
- Confirms both tabs exist by name
- Reads each mapped cell and reports its current value
- Detects formulas in cells the wizard expects to write to (these should be plain input cells)
- Checks that Benefits Calc column G contains formulas (expected calculation cells)
- Produces a summary with a warning count

## How to Run It

1. Open the Google Sheet containing the Arena Value Wizard
2. Go to **Extensions > Apps Script** to open the script editor
3. In the file list on the left, select `SheetAudit.gs`
4. In the function dropdown at the top, select **`runSheetAudit`**
5. Click the **Run** button (play icon)
6. If prompted, authorize the script (first run only)

## Reading the Output

After running, open the execution log:

- Click **Execution log** at the bottom of the editor, or
- Go to **View > Logs** (legacy Logger)

The output is structured in sections:

```
=== Arena Value Wizard — Sheet Audit ===
Run date: 2026-03-05T...

--- DATA INPUT TAB (Data Input) ---
[OK] customerName → D3 | value: "Acme Corp" | storeAs: text
[OK] annualRevenue → D4 | value: 50000000 | storeAs: currency
...

--- BENEFITS CALC TAB (Benefits Calc) ---
[OK] reduceScrappedParts | imp(D5)=10 | inc(F5)="Yes" | calc(G5)=formula
...

--- SUMMARY ---
Warnings: 0
Audit complete.
```

Each line shows:
- **Status**: `[OK]` or `[WARNING]`
- **Field ID** and its cell reference
- **Current value** in the cell
- **storeAs type** (how the wizard converts data before writing)

## Understanding WARNING Messages

Warnings indicate potential misalignment between the wizard configuration and the sheet structure:

| Warning | Meaning | Action |
|---------|---------|--------|
| **Cell has formula** (Data Input) | A cell the wizard writes to contains a formula instead of being a plain input cell. The wizard will overwrite the formula. | Check if the cell should be a yellow input cell. If so, remove the formula from the sheet. If the formula is intentional, remove the field from Config.gs. |
| **Improvement col has formula** (Benefits Calc) | The improvement percentage cell has a formula. The wizard expects to write a plain number here. | Same as above — verify whether this should be a writable cell. |
| **Benefit calc col G has no formula** | Column G is expected to contain a calculation formula, but the cell is empty or has a static value. | Check if the sheet formulas were accidentally deleted. Column G should compute the dollar benefit from the improvement percentage. |

### When to Be Concerned

- **0 warnings**: Everything is aligned. The wizard and sheet agree on which cells are inputs vs. calculations.
- **1-2 warnings**: Likely a minor sheet edit that shifted things. Investigate the specific cells.
- **Many warnings**: The sheet structure may have changed significantly. Compare the audit output against `Config.gs` field definitions and update the config if needed.

## Using Results to Verify Wizard Alignment

Run the audit after any of these events:

1. **Initial setup** — confirm the wizard is correctly wired to the sheet
2. **After editing Config.gs** — verify new field mappings point to the right cells
3. **After sheet structure changes** — if rows were inserted/deleted, run the audit to catch shifted references
4. **After a `clasp push`** — quick sanity check that the deployed code matches the sheet

If you find misalignment, update the `row` values in `Config.gs` to match the current sheet layout, then re-run the audit to confirm the fix.
